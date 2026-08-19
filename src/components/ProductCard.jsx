function ProductCard({ product }) {
  return (
    <article>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
    </article>
  );
}

export default ProductCard;
