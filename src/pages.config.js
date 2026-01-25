import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "ReportIssue": ReportIssue,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};