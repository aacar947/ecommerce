import { Link } from 'react-router';
import { slugParser } from '../utils/slugParser';
import '../styles/product-review-table.css';
export default function ProductReviewTable({ products, children }) {
  return (
    <table className='product-review-list'>
      {products?.map((product) => {
        const { thumbnail, title, quantity, discountedTotal, discountedPrice, id } = product;
        const url = `/p/${slugParser.slugify({ title, id })}`;
        return (
          <tbody key={'product-' + id}>
            <tr>
              <td className='product-image-cell' rowSpan='100'>
                <div className='product-header'>
                  <Link to={url}>
                    <img src={thumbnail} aira-label={title} />
                  </Link>
                </div>
              </td>
              <th>
                <Link to={url} className='product-title pale'>
                  <span>{title}</span>
                </Link>
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
