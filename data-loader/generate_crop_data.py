import psycopg2
import random
from datetime import datetime

conn = psycopg2.connect(
    dbname="agri_decision_lab",
    user="postgres",
    password="postgres123",
    host="localhost",
    port="5432"
)

cur = conn.cursor()

START_YEAR = 2010
END_YEAR = 2024

# fetch districts & crops
cur.execute("SELECT district_id FROM crop_planner.districts_tn")
districts = [r[0] for r in cur.fetchall()]

cur.execute("SELECT crop_id FROM crop_planner.crops")
crops = [r[0] for r in cur.fetchall()]

rows = 0

for d in districts:
    for c in crops:
        base_price = random.randint(1200, 6500)

        for year in range(START_YEAR, END_YEAR + 1):
            volatility = random.uniform(0.08, 0.25)
            avg_price = int(base_price * random.uniform(0.9, 1.15))
            min_price = int(avg_price * (1 - volatility))
            max_price = int(avg_price * (1 + volatility))
            std_dev = int((max_price - min_price) * 0.35)

            cur.execute("""
                INSERT INTO crop_planner.mandi_price_history
                (district_id, crop_id, year,
                 avg_price_qtl, min_price_qtl,
                 max_price_qtl, price_std_dev)
                VALUES (%s,%s,%s,%s,%s,%s,%s)
            """, (
                d, c, year,
                avg_price, min_price, max_price, std_dev
            ))

            rows += 1

conn.commit()
print(f"✅ mandi_price_history populated: {rows} rows")