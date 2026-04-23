from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# ===== DB CONNECTION =====
def get_db_connection():
    return mysql.connector.connect(
        host="127.0.0.1",
        user="bususer",      # or root
        password="1234",
        database="bus_tracking",
        use_pure=True,
        charset="utf8",              # 🔥 force supported charset
        collation="utf8_general_ci", # 🔥 force supported collation
        auth_plugin="mysql_native_password"
    )

# ===== HOME =====
@app.route("/")
def home():
    return "Backend Running 🚀"

# ===== GET BUSES =====
@app.route("/buses")
def get_buses():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                b.id,
                b.bus_name,
                r.source,
                r.destination,
                b.status,
                t.latitude,
                t.longitude,
                t.eta
            FROM buses b
            JOIN routes r ON b.route_id = r.id
            JOIN tracking t ON b.id = t.bus_id
        """)

        data = cursor.fetchall()

        cursor.close()
        db.close()

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)})

# ===== UPDATE SYSTEM =====
@app.route("/update")
def update_buses():
    try:
        db = get_db_connection()
        cursor = db.cursor()

        # ETA decrease
        cursor.execute("""
            UPDATE tracking
            SET eta = CASE
                WHEN eta <= 0 THEN 20
                ELSE eta - 1
            END
        """)

        # update status (simple logic)
        cursor.execute("SELECT bus_id, eta FROM tracking")
        rows = cursor.fetchall()

        for row in rows:
            bus_id = row[0]
            eta = row[1]

            if eta == 0:
                status = "Completed"
            elif eta > 15:
                status = "Delayed"
            else:
                status = "Running"

            cursor.execute(
                "UPDATE buses SET status=%s WHERE id=%s",
                (status, bus_id)
            )

        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "updated"})

    except Exception as e:
        return jsonify({"error": str(e)})

# ===== RUN =====
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)