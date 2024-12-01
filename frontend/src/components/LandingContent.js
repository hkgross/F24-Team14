import truck from "../assets/truck-banner.jpg";
import wheel from "../assets/steering-wheel-icon-light.png";
import point from "../assets/point-icon-light.png";
import reward from "../assets/reward-icon-light.png";
export default function LandingContent() {
    return (
        <div>
            <div className="banner">
                <img src={truck}></img>
                <div className="banner-text-container">
                    <h1 className="font-karla">DRIVING WITH PURPOSE</h1>
                    <p className="font-merriweather">Connecting truckers across the nation</p>
                </div>
            </div>
            <div className="landing-menu font-karla basic-flex">
                <div className="landing-menu-content basic-flex">
                    <h2>Get started today</h2>
                    <div className="banner-btn-container basic-flex">
                        <a href="/create" className="banner-btn" id="register-banner-btn">Register</a>
                        <a href="/login" className="banner-btn" id="login-banner-btn">Login</a>
                    </div>
                </div>
            </div>
            <div className="landing-info-parent-container basic-flex">
                <div className="landing-info-container basic-flex font-karla">
                    <div className="landing-info-text-container basic-flex">
                        <h2>01</h2>
                        <h1>JOIN</h1>
                        <img className="landing-icon" src={wheel}></img>
                        <p className="font-merriweather">Join a sponsor</p>
                    </div>
                    <div className="landing-info-text-container basic-flex">
                        <h2>02</h2>
                        <h1>EARN</h1>
                        <img className="landing-icon" src={point}></img>
                        <p className="font-merriweather">Earn points while driving</p>
                    </div>
                    <div className="landing-info-text-container basic-flex">
                        <h2>03</h2>
                        <h1>REDEEM</h1>
                        <img className="landing-icon" src={reward}></img>
                        <p className="font-merriweather">Redeem rewards with your points</p>
                    </div>
                </div>
            </div>
        </div>
    )
}