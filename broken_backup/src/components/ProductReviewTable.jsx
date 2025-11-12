import '../styles/product-review-table.css';
export default function ProductReviewTable({ products, children, onHeaderClick }) {
  return (
    <table className='product-review-list'>
      {products?.map((product) => {
        const { thumbnail, title, quantity, discountedTotal, discountedPrice, id } = product;
        return (
          <tbody key={'product-' + id}>
            <tr>
              <td className='product-image-cell' rowSpan='100'>
                <div className='product-header' onClick={() => onHeaderClick && onHeaderClick(product)}>
                  <img src={thumbnail} aira-label={title} />
                </div>
              </td>
              <th>
                <div className='product-title' onClick={() => onHeaderClick && onHeaderClick(product)}>
                  <span className='pastel'>{title}</span>
                </div>
              </th>
            </tr>
            <tr>
              <td className='pale'>x{quantity}</td>
            </tr>
            <tr>
              <td className='bold'>${(discountedTotal || discountedPrice).toFixed(2)}</td>
            </tr>
            {children && children(product)}
          </tbody>
        );
      })}
    </table>
  );
}
