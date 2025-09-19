export default function UnstableHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Unstable Experiments</h1>
      <p className="text-gray-600">Experimental tools. Toggle via Settings → Features.</p>
      <ul className="list-disc pl-6">
        <li><a className="text-blue-600 hover:underline" href="/admin/unstable/blog/new">Novel Editor: Create Blog Post</a></li>
      </ul>
    </div>
  );
}
