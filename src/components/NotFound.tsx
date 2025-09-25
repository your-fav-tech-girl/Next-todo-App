// src/components/NotFound.jsx
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white shadow rounded-lg p-6 space-y-6 text-center">
        <h1 className="text-5xl font-extrabold">404</h1>
        <p className="text-gray-600">Not Found.</p>
        <Button>
          <Link to="/">← Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
