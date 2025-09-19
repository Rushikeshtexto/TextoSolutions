import React from 'react';
import styles from  './Footer.module.css';
import facebook from "../../assets/facebooklogo.png";
import instagram from "../../assets/instagramlogo.jpg";
import twitter from "../../assets/twitterlogo.png";
import texto from "../../assets/Media.jpg";
import youtube from "../../assets/youtubelogo.png";
import linkdin from "../../assets/linkedinlogo.jpg";




const Footer = () => {
  return (
  <>
  <footer className={styles.footer}>
          <div className={styles.footer_logo}>
            <img className={styles.logo} src={texto} alt="Logo" /> Texto
          </div>
  
          <div className={styles.footer_grid}>
            <table>
              <tbody>
                <tr>
                  <td>
                    <h4>Follow us</h4>
                  </td>
                  <td>
                    <a href="#">
                      <img
                        className={styles.social}
                        src={linkdin}
                        alt="LinkedIn"
                      />
                    </a>
                  </td>
                  <td>
                    <a href="#">
                      <img
                        className={styles.social}
                        src={twitter}
                        alt="Twitter"
                      />
                    </a>
                  </td>
                  <td>
                    <a href="#">
                      <img
                        className={styles.social}
                        src={facebook}
                        alt="Facebook"
                      />
                    </a>
                  </td>
                  <td>
                    <a href="#">
                      <img
                        className={styles.social}
                        src={instagram}
                        alt="Instagram"
                      />
                    </a>
                  </td>
                  <td>
                    <a href="#">
                      <img
                        className={styles.social}
                        src={youtube}
                        alt="YouTube"
                      />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <div className={styles.footer_bottom}>
            <p className={styles.legal}>
              Privacy | Security | Cookies | Terms | DLT
            </p>
          </div>
        </footer>
  </>
  )
}

export default Footer