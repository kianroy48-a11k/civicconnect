import CivicPulse from './pages/CivicPulse';
import Home from './pages/Home';
import IssueDetail from './pages/IssueDetail';
import IssueMap from './pages/IssueMap';
import LeaderProfile from './pages/LeaderProfile';
import Leaderboard from './pages/Leaderboard';
import ReportIssue from './pages/ReportIssue';
import Profile from './pages/Profile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CivicPulse": CivicPulse,
    "Home": Home,
    "IssueDetail": IssueDetail,
    "IssueMap": IssueMap,
    "LeaderProfile": LeaderProfile,
    "Leaderboard": Leaderboard,
    "ReportIssue": ReportIssue,
    "Profile": Profile,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};