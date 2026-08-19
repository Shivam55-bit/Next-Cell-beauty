import { useState } from "react";
import { X, Copy, Check, Share2 } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaTwitter, FaTelegram } from "react-icons/fa";
import toast from "react-hot-toast";
import styles from "./ShareModal.module.css";

export default function ShareModal({ isOpen, onClose, product }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://next-cell-beauty-storee.onrender.com/product/${product.slug || product.id}`;
  const shareText = `Check out ${product.name} on Next Cell Beauty!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Product link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: shareUrl
        });
      } catch (e) {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <Share2 size={20} className={styles.shareIcon} />
            <h3>Share this Product</h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className={styles.productSnippet}>
          <img src={Array.isArray(product.images) && product.images[0] ? product.images[0] : product.image} alt={product.name} />
          <div>
            <h4>{product.name}</h4>
            <p>₹{Number(product.price).toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className={styles.socialButtons}>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className={`${styles.socialBtn} ${styles.whatsapp}`}>
            <FaWhatsapp size={22} />
            <span>WhatsApp</span>
          </a>
          <a href={facebookUrl} target="_blank" rel="noreferrer" className={`${styles.socialBtn} ${styles.facebook}`}>
            <FaFacebook size={22} />
            <span>Facebook</span>
          </a>
          <a href={twitterUrl} target="_blank" rel="noreferrer" className={`${styles.socialBtn} ${styles.twitter}`}>
            <FaTwitter size={22} />
            <span>Twitter / X</span>
          </a>
          <a href={telegramUrl} target="_blank" rel="noreferrer" className={`${styles.socialBtn} ${styles.telegram}`}>
            <FaTelegram size={22} />
            <span>Telegram</span>
          </a>
        </div>

        <div className={styles.linkCopyBox}>
          <input type="text" readOnly value={shareUrl} />
          <button type="button" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {typeof navigator !== "undefined" && navigator.share && (
          <button type="button" className={styles.nativeBtn} onClick={handleNativeShare}>
            Open Device Share Menu
          </button>
        )}
      </div>
    </div>
  );
}
