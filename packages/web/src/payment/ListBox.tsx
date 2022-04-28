function ListBox({ title, list }) {
  return (
    <div className="h-full w-full rounded bg-white p-5 shadow shadow-sm">
      <h3 className="mb-3 text-2xl">{title}</h3>
      {list.length <= 0 ? (
        <small className="lock text-1xl">N/A</small>
      ) : (
        <ul className="list-disc pl-5">
          {list.map((pkg, index) => (
            <li key={index}>
              <small key={index}>{pkg}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListBox;
