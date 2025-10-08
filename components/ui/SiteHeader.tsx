import Link from 'next/link';
import Image from 'next/image';

const SiteHeader = () => (
  <header className="site-header">
    <div className="logo-container">
      <Link href="/">
        <Image 
          src="/images/title.png" 
          alt="Robert Hunter Performance Archive" 
          width={200} 
          height={184}
          className="site-logo"
        />
      </Link>
    </div>
    
    <div className="nav-bar">
      <div className="nav-bar-content">
        <nav className="main-nav">
          <Link href="/event" className="nav-link">Shows</Link>
          <Link href="/song" className="nav-link">Songs</Link>
          <Link href="/venue" className="nav-link">Venues</Link>
          <Link href="/band" className="nav-link">Bands</Link>
          <Link href="/hunter" className="nav-link">Hunter</Link>
          <Link href="/about" className="nav-link">About</Link>
        </nav>
        
        {/* <input 
          type="text" 
          className="header-search-box" 
          placeholder="Search shows, songs, venues..."
        /> */}
      </div>
    </div>
  </header>
);

export default SiteHeader;
