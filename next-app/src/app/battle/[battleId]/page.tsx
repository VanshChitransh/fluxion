export default async function ActiveBattlePage(
  props: { params: Promise<{ battleId: string }> }
) {
  const params = await props.params;
  
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Active Battle</h1>
      <p className="mt-4 text-gray-600">Battle ID: {params.battleId}</p>
      <p className="mt-2 text-gray-600">
        Live trading interface will appear here
      </p>
    </div>
  );
}

