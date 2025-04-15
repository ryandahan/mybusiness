import EditStoreClient from './client-component';

export default async function EditStorePage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  return (
    <div data-store-id={resolvedParams.id}>
      <EditStoreClient id={resolvedParams.id} />
    </div>
  );
}