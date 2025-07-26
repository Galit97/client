import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type Vendor = {
  _id: string;
  vendorName: string;
  price: number;
  type: string;
};

type PieDataItem = {
  name: string;
  value: number;
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28EFF",
  "#FF6666",
  "#33CC99",
  "#FF9933",
];

const BudgetPage: React.FC = () => {
  const [budget, setBudget] = useState<number>(0);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [guestCount, setGuestCount] = useState<number>(0);
  const [savings, setSavings] = useState<number>(0);

  useEffect(() => {
    async function fetchBudgetData() {
      try {
        const res = await fetch("/api/wedding-budget-details"); // הנתיב בשרת שלך
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();

        setBudget(data.budget);
        setVendors(data.vendors);
        setGuestCount(data.totalGuests);
        setSavings(data.savings || 0);
      } catch (error) {
        console.error(error);
      }
    }
    fetchBudgetData();
  }, []);

  const totalExpenses = useMemo(
    () => vendors.reduce((sum, v) => sum + v.price, 0),
    [vendors]
  );

  const pieData: PieDataItem[] = useMemo(() => {
    const map = new Map<string, number>();
    vendors.forEach(({ type, price }) => {
      map.set(type, (map.get(type) || 0) + price);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [vendors]);

  const costPerGuest = guestCount > 0 ? totalExpenses / guestCount : 0;

  const barData = [
    { name: "תקציב כולל", value: budget },
    { name: "הוצאות בפועל", value: totalExpenses },
    { name: "חיסכון (מוקצה)", value: savings },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "auto", fontFamily: "Arial, sans-serif", padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>ניהול תקציב האירוע</h1>

      {/* טופס עריכת תקציב */}
      <div style={{ marginBottom: 20 }}>
        <label>
          תקציב אירוע (₪):
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            min={0}
            style={{ marginLeft: 10, padding: 4, width: 120 }}
          />
        </label>
      </div>

      {/* שאר הרכיבים שלך כמו טבלה, גרפים וכו' */}

      {/* רשימת ספקים */}
      <section style={{ marginBottom: 30 }}>
        <h2>רשימת הוצאות</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>שם ספק</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>סכום (₪)</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>סוג ספק</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(({ _id, vendorName, price, type }) => (
              <tr key={_id}>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>{vendorName}</td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>{price.toLocaleString()}</td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>{type}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>סך הכל</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{totalExpenses.toLocaleString()}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* עלות מנה לראש */}
      <section style={{ marginBottom: 40 }}>
        <h2>עלות מנה לראש</h2>
        <label>
          מספר מוזמנים:&nbsp;
          <input
            type="number"
            value={guestCount}
            min={1}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            style={{ width: 80, padding: 4 }}
          />
        </label>
        <p style={{ marginTop: 10 }}>
          <strong>סה"כ הוצאות:</strong> ₪{totalExpenses.toLocaleString()}
        </p>
        <p>
          <strong>עלות למנה:</strong> ₪{costPerGuest.toFixed(2)}
        </p>
        <p>
          <strong>חיסכון שהוקצה בצד:</strong> ₪{savings.toLocaleString()}
        </p>
      </section>

      {/* גרף עוגה */}
      <section>
        <h2>התפלגות הוצאות לפי סוג ספקים</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry: PieDataItem) =>
                `${entry.name}: ₪${entry.value.toLocaleString()}`
              }
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `₪${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default BudgetPage;
