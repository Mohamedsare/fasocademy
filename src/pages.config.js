/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminDashboard from './pages/AdminDashboard';
import AssignmentReview from './pages/AssignmentReview';
import Catalog from './pages/Catalog';
import CourseBuilder from './pages/CourseBuilder';
import CoursePage from './pages/CoursePage';
import Home from './pages/Home';
import InstructorAnalytics from './pages/InstructorAnalytics';
import InstructorDashboard from './pages/InstructorDashboard';
import LessonPlayer from './pages/LessonPlayer';
import MyLearning from './pages/MyLearning';
import Notifications from './pages/Notifications';
import PackBuilder from './pages/PackBuilder';
import Profile from './pages/Profile';
import QuizBuilder from './pages/QuizBuilder';
import VerifyCertificate from './pages/VerifyCertificate';
import BecomeInstructor from './pages/BecomeInstructor';
import Blog from './pages/Blog';
import Help from './pages/Help';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "AssignmentReview": AssignmentReview,
    "Catalog": Catalog,
    "CourseBuilder": CourseBuilder,
    "CoursePage": CoursePage,
    "Home": Home,
    "InstructorAnalytics": InstructorAnalytics,
    "InstructorDashboard": InstructorDashboard,
    "LessonPlayer": LessonPlayer,
    "MyLearning": MyLearning,
    "Notifications": Notifications,
    "PackBuilder": PackBuilder,
    "Profile": Profile,
    "QuizBuilder": QuizBuilder,
    "VerifyCertificate": VerifyCertificate,
    "BecomeInstructor": BecomeInstructor,
    "Blog": Blog,
    "Help": Help,
    "Contact": Contact,
    "Terms": Terms,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};