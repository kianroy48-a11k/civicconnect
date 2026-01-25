import CivicPulse from './pages/CivicPulse';
import Home from './pages/Home';
import IssueDetail from './pages/IssueDetail';
import IssueMap from './pages/IssueMap';
import LeaderProfile from './pages/LeaderProfile';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import ReportIssue from './pages/ReportIssue';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CivicPulse": CivicPulse,
    "Home": Home,
    "IssueDetail": IssueDetail,
    "IssueMap": IssueMap,
    "LeaderProfile": LeaderProfile,
    "Leaderboard": Leaderboard,
    "Profile": Profile,
    "ReportIssue": ReportIssue,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};