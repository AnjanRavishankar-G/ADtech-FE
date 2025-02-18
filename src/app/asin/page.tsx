async function fetchAsinData() {
    const res = await fetch("http://127.0.0.1:8000/get_report/asin_level_table", { cache: "no-store" });
  
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status}`);
    }
  
    return res.json();
  }
  
  export default async function AsinPage() {
    const data = await fetchAsinData();
  
    if (!Array.isArray(data) || data.length === 0) {
      return <h1 style={{ color: "red" }}>No data available</h1>;
    }
  
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>ASIN Level Performance Report</h1>
        <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>SN</th>
              <th>ASIN</th>
              <th>SKU</th>
              <th>Campaign Name</th>
              <th>Ad Group Name</th>
              <th>Campaign Status</th>
              <th>Impressions</th>
              <th>Clicks</th>
              <th>CTR</th>
              <th>Cost</th>
              <th>Sales (1d)</th>
              <th>Purchases (1d)</th>
              <th>ACoS</th>
              <th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.SN}>
                <td>{item.SN}</td>
                <td>{item.advertisedAsin}</td>
                <td>{item.advertisedSku}</td>
                <td>{item.campaignName}</td>
                <td>{item.adGroupName}</td>
                <td>{item.campaignStatus}</td>
                <td>{item.impressions}</td>
                <td>{item.clicks}</td>
                <td>{(item.clickThroughRate * 100).toFixed(2)}%</td>
                <td>₹{parseFloat(item.cost).toFixed(2)}</td>
                <td>₹{parseFloat(item.sales1d).toFixed(2)}</td>
                <td>{item.purchases1d}</td>
                <td>{item.ACoS}%</td>
                <td>{item.ROAS.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }