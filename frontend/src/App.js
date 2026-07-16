import { useEffect, useState } from "react";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

function App() {
  const [votes, setVotes] = useState({ cat: 0, dog: 0 });
  const [loading, setLoading] = useState(false);

  async function fetchVotes() {
    const res = await fetch(`${BACKEND_URL}/api/votes`);
    const data = await res.json();
    const map = {};
    data.forEach((v) => (map[v.option] = v.count));
    setVotes({ cat: map.cat || 0, dog: map.dog || 0 });
  }

  useEffect(() => {
    fetchVotes();
  }, []);

  async function vote(option) {
    setLoading(true);
    await fetch(`${BACKEND_URL}/api/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ option }),
    });
    await fetchVotes();
    setLoading(false);
  }

  const total = votes.cat + votes.dog;

  return (
    <div className="container">
      <h1>Cat vs Dog</h1>
      <p>Who is the better pet?</p>
      <div className="buttons">
        <button onClick={() => vote("cat")} disabled={loading}>
          Cat
        </button>
        <button onClick={() => vote("dog")} disabled={loading}>
          Dog
        </button>
      </div>
      <div className="results">
        <p>Cat: {votes.cat} votes</p>
        <p>Dog: {votes.dog} votes</p>
        <p>Total: {total} votes</p>
      </div>
    </div>
  );
}

export default App;
