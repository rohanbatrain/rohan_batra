export default function UnstableHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Unstable Experiments</h1>
      <p className="text-gray-600">Experimental tools. Toggle via Settings → Features.</p>
      <ul className="list-disc pl-6">
        <li className="text-gray-500">No experiments available right now.</li>
      </ul>
    </div>
  );
}
