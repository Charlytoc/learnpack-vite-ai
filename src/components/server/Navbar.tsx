import BuildButton from '../client/BuildButton'
import FeedbackButton from '../client/FeedbackButton'
import Sidebar from './Sidebar'
import ResetButton from '../client/ResetButton'
export default function Navbar () {
    return <nav className="navbar-component">
        <section>
            <img src="/logo.png"  alt='Learnpack' style={{width:"40px", height:"auto"}} />
            <BuildButton />
            <FeedbackButton />
            <ResetButton />
        </section>
        <Sidebar />
    </nav>
}