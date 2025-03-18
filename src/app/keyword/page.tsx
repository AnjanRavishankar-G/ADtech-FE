import { fetchWithAuth } from "@/utils/fetchWithAuth";

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function fetchKeywords() {
<<<<<<< HEAD
  const res = await fetch(`${backendURL}/report/keyword_report`, {
=======
  const res = await fetchWithAuth(`${backendURL}/get_report/keyword_report`, {
>>>>>>> cd09df6d4b71376fb451636cdca3082e562415ba
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch data: ${res.status}`);
  }

  return res.json();
}

export default async function KeywordsPage() {
  const data = await fetchKeywords();

  // Filter for spKeywords source
  const spKeywordsData = Array.isArray(data)
    ? data.filter((item) => item.Source === "spKeyword")
    : [];

  if (spKeywordsData.length === 0) {
    return <h1 style={{ color: "red" }}>No spKeywords data available</h1>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "lato" }}>
      <h1>Keyword Performance Report </h1>
      <table
        border={1}
        cellPadding={8}
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Keyword</th>
            <th>Match Type</th>
            <th>Search Term</th>
            <th>Cost</th>
            <th>Clicks</th>
            <th>Impressions</th>
            <th>Sales (30d)</th>
            <th>Purchases (30d)</th>
            <th>Top of Search Impression Share</th>
          </tr>
        </thead>
        <tbody>
          {spKeywordsData.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.keyword || "N/A"}</td>
              <td>{item.matchType}</td>
              <td>{item.searchTerm !== "None" ? item.searchTerm : "N/A"}</td>
              <td>₹{parseFloat(item.cost).toFixed(2)}</td>
              <td>{item.clicks}</td>
              <td>{item.impressions}</td>
              <td>₹{parseFloat(item.sales30d).toFixed(2)}</td>
              <td>{item.purchases30d}</td>
              <td>
                {isNaN(parseFloat(item.topOfSearchImpressionShare))
                  ? "N/A"
                  : `${parseFloat(item.topOfSearchImpressionShare).toFixed(
                      2
                    )}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
