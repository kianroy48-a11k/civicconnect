import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import IssueMap from './pages/IssueMap';
import IssueDetail from './pages/IssueDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "ReportIssue": ReportIssue,
    "IssueMap": IssueMap,
    "IssueDetail": IssueDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};