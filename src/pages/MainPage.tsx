
export default function MainPage() {
  const token = localStorage.getItem('token');

  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold text-gray-800">Welcome to TransSolutions</h1>
      <p className="text-xl text-gray-600 mt-4">

      </p>
      {!token && (
        <div className="mt-8">
          <p className="text-gray-500">Please login or register to manage your fleet.</p>
        </div>
      )}
    </div>
  );
}
