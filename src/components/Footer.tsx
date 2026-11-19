import Logo from '../assets/images/liceu-logo.svg'
import { address, instagramHandle, instagramLink } from '../lib/contact'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <a className="footer-brand" href="#inicio" aria-label="Rede Liceu — Unidade Suzano">
            <img src={Logo} alt="Rede Liceu — Unidade Suzano" width={80} height={26} />
          </a>

          <nav className="footer-nav" aria-label="Rodapé">
            <a href="#inicio">A escola</a>
            <a href="#inicio">Estrutura</a>
            <a href="#inicio">Localização</a>
            <a href="#inicio">Dúvidas</a>
            <a href="#agendar">Agendar uma visita</a>
          </nav>
        </div>

        <hr className="footer-line" />

        <div className="footer-bottom">
          <p className="footer-address">
            <a href={instagramLink} target="_blank" rel="noreferrer">@{instagramHandle}</a>
            {' ∙ '}
            {address}
          </p>
          <p className="footer-copy">© 2026 Rede Liceu Suzano. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
