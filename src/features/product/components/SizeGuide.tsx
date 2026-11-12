export function SizeGuide({ shoes }: { shoes: boolean }) {
  const rows = shoes
    ? [['25', '25 cm'], ['25.5', '25.5 cm'], ['26', '26 cm'], ['26.5', '26.5 cm'], ['27', '27 cm'], ['27.5', '27.5 cm'], ['28', '28 cm'], ['29', '29 cm']]
    : [['XS', '84-88', '70-74'], ['S', '88-94', '74-80'], ['M', '94-100', '80-86'], ['L', '100-106', '86-92'], ['XL', '106-112', '92-98']];
  return (
    <details id="guia-tallas" className="border-t border-line py-4">
      <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide">Guía de tallas</summary>
      <table className="mt-3 w-full text-left text-sm">
        <thead className="text-xs uppercase text-muted">
          <tr>{(shoes ? ['Talla MX', 'Largo del pie'] : ['Talla', 'Pecho (cm)', 'Cintura (cm)']).map((h) => <th key={h} className="py-1 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody>{rows.map((r) => <tr key={r[0]} className="border-t border-line">{r.map((c, i) => <td key={i} className="py-1.5">{c}</td>)}</tr>)}</tbody>
      </table>
    </details>
  );
}
