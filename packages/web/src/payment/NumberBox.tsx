function NumberBox({ title, value, prefix = '' }) {
  return (
    <div className="shadox-sm h-full w-full rounded bg-white p-5 shadow">
      <h3 className="text-1xl mb-2">{title}</h3>
      <div className="text-3xl">
        {prefix}
        {value.toLocaleString('en-US')}
      </div>
    </div>
  );
}

export default NumberBox;
