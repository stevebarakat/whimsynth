import { ExternalLink } from "lucide-react";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      Built with guidance from{" "}
      <a
        href="https://www.joshwcomeau.com/blog/whimsical-animations/#the-synth-6"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        <span className={styles.linkContent}>
          Josh Comeau&apos;s Whimsical Animations article
          <ExternalLink size={12} aria-hidden />
        </span>
      </a>
    </footer>
  );
}

export default Footer;
