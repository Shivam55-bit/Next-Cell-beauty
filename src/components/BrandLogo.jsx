import logoImage from "../assets/logo/next-cell-beauty-frontend_logo.png";

function BrandLogo({ compact = false, light = false, className = '' }) {
  return (
    <img
      src={logoImage}
      alt="NEXT CELL BEAUTY logo"
      className={`block max-w-full h-auto ${compact ? 'w-24' : 'w-32'} ${className}`}
    />
  );
}

export default BrandLogo;
