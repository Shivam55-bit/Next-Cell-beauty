import styles from "./PlaceholderPage.module.css";

function PlaceholderPage({ title, description }) {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1>{title}</h1>
        <p>{description || "This admin section is under construction."}</p>
      </div>

      <section className={styles.contentCard}>
        <p>
          The sidebar navigation is now wired to this route. You can replace
          this placeholder with the actual admin UI for {title}.
        </p>
      </section>
    </div>
  );
}

export default PlaceholderPage;
