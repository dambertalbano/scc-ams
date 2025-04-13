import '@fontsource/inter';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { forwardRef, useContext, useEffect, useState } from 'react'; // Import forwardRef
import { FiMenu, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { StudentContext } from '../context/StudentContext';
import { TeacherContext } from '../context/TeacherContext';

// Use forwardRef to pass the ref to the DOM element
const Navbar = forwardRef((props, ref) => {
    const { dToken, setDToken } = useContext(TeacherContext);
    const { aToken, setAToken } = useContext(AdminContext);
    const { sToken, setSToken } = useContext(StudentContext);
    const navigate = useNavigate();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
                setOpenDropdown(null);
                setIsUserDropdownOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleLogout = () => {
        navigate('/');
        setAToken(null);
        setDToken(null);
        setSToken(null);
        localStorage.removeItem('sToken');
        localStorage.removeItem('dToken');
        localStorage.removeItem('aToken');
        // Force a re-render to trigger the useEffect in App.jsx
        window.location.reload();
    };

    const handleProfileNavigation = () => {
        if (dToken) {
            navigate('/teacher-profile');
        } else if (sToken) {
            navigate('/student-profile');
        }
        setIsUserDropdownOpen(false);
    };

    const handleScan = () => {
        navigate('/rfid-scan');
    };

    const handleDashboard = () => {
        if (aToken) {
            navigate('/admin-dashboard');
        } else if (dToken) {
            navigate('/teacher-dashboard');
        } else if (sToken) {
            navigate('/student-dashboard');
        }
    };

    const getNavItems = () => {
        if (aToken) {
            return [
                {
                    title: 'Attendance',
                    path: '/attendance',
                },
                {
                    title: 'User List',
                    path: '/all-users',
                    subMenu: [
                        { name: 'Student', path: '/student-list' },
                        { name: 'Teacher', path: '/teacher-list' },
                    ],
                },
                {
                    title: 'Add User',
                    path: '/add-users',
                    subMenu: [
                        { name: 'Add Student', path: '/add-student' },
                        { name: 'Add Teacher', path: '/add-teacher' },
                    ],
                },
            ];
        } else if (dToken) {
            return [
                { title: 'Attendance', path: '/att1' },
            ];
        } else if (sToken) {
            return [
                { title: 'Attendance', path: '/att2' },
            ];
        } else {
            return [];
        }
    };

    const getUserRoleLabel = () => {
        if (aToken) {
            return 'Admin';
        } else if (dToken) {
            return 'Teacher';
        } else if (sToken) {
            return 'Student';
        }  else {
            return 'User';
        }
    };

    const getSignOutLabel = () => {
        if (aToken) {
            return 'Sign Out Admin';
        } else if (dToken) {
            return 'Sign Out Teacher';
        } else if (sToken) {
            return 'Sign Out Student';
        } else {
            return 'Sign Out';
        }
    };

    const navItems = getNavItems();
    const userRoleLabel = getUserRoleLabel();
    const signOutLabel = getSignOutLabel();

    // Function to get the Attendance link based on user role
    const getAttendanceLink = () => {
        if (aToken) return '/attendance';
        if (dToken) return '/attendance-teacher';
        if (sToken) return '/attendance-student';
        return '/attendance'; // Default if no token
    };

    const toggleDropdown = (index) => {
        setOpenDropdown(openDropdown === index ? null : index);
    };

    // Function to get the dashboard link based on user role
    const getDashboardLink = () => {
        if (aToken) return '/admin-dashboard';
        if (dToken) return '/teacher-dashboard';
        if (sToken) return '/student-dashboard';
        return '/'; // Default if no token
    };

    // Determine if the user is logged in
    const isLoggedIn = aToken || dToken || sToken ;

    // Only navigate to the appropriate dashboard when clicking the logo
    const handleLogoClick = () => {
        if (isLoggedIn) {
            handleDashboard();
        } else {
            navigate('/');
        }
    };

    return (
        <>
            {isLoggedIn && (
                <nav className='fixed top-0 w-full z-50 flex justify-between items-center px-4 sm:px-10 py-3 bg-navbar font-sans' ref={ref}> {/* Attach the ref to the nav element */}
                    <div className='flex items-center gap-2 text-xs sm:text-sm'>
                        <img
                            onClick={handleLogoClick}
                            className='w-24 sm:w-32 md:w-36 lg:w-40 cursor-pointer'
                            src={assets.admin_logo}
                            alt='Logo'
                        />
                    </div>

                    {isLoggedIn && (
                        <button
                            className='block lg:hidden text-white p-1'
                            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        >
                            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    )}

                    <AnimatePresence>
                        {isMobileMenuOpen && isLoggedIn && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className='absolute top-16 right-0 bg-navbar p-4 flex flex-col rounded-b-lg shadow-md'
                            >
                                <div className='flex flex-col gap-2'>
                                    <button
                                        onClick={handleDashboard}
                                        className='text-white py-2 text-left hover:text-customRed transition-colors duration-200 rounded-md px-3'
                                    >
                                        {userRoleLabel} Dashboard
                                    </button>
                                    
                                    {aToken && (
                                        <button
                                            onClick={handleScan}
                                            className='text-white py-2 text-left hover:text-customRed transition-colors duration-200 rounded-md px-3'
                                        >
                                            Scan
                                        </button>
                                    )}

                                    {navItems.map((menu, index) => {
                                        if (!menu.subMenu) {
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        navigate(menu.path);
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                    className='w-full text-white py-2 text-left flex justify-between items-center hover:text-customRed transition-colors duration-200 rounded-md px-3'
                                                >
                                                    {menu.title}
                                                </button>
                                            );
                                        }
                                        return (
                                            <div key={index} className='relative'>
                                                <button
                                                    onClick={() => toggleDropdown(index)}
                                                    className='w-full text-white py-2 text-left flex justify-between items-center hover:text-customRed transition-colors duration-200 rounded-md px-3'
                                                >
                                                    {menu.title}
                                                    <span>
                                                        {openDropdown === index ? (
                                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </span>
                                                </button>

                                                <AnimatePresence>
                                                    {openDropdown === index && menu.subMenu && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className='pl-4 mt-1 rounded-md'
                                                        >
                                                            {menu.subMenu.map((subItem, subIndex) => (
                                                                <button
                                                                    key={subIndex}
                                                                    onClick={() => {
                                                                        navigate(subItem.path);
                                                                        setIsMobileMenuOpen(false);
                                                                    }}
                                                                    className='block w-full text-left text-white py-2 px-4 hover:text-customRed transition-colors duration-200 rounded-md'
                                                                >
                                                                    {subItem.name}
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}

                                    {(dToken || sToken ) && (
                                        <button
                                            onClick={handleProfileNavigation}
                                            className='text-white py-2 text-left hover:text-customRed transition-colors duration-200 rounded-md px-3'
                                        >
                                            Profile
                                        </button>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        className='text-white bg-customRed bg-opacity-75 py-2 px-4 text-center hover:text-navbar rounded-md transition-colors duration-200'
                                    >
                                        {signOutLabel}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isLoggedIn && (
                        <div className='hidden lg:flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8'>
                            <FlyoutLink
                                title={`${userRoleLabel} Dashboard`}
                                onClick={handleDashboard}
                            />
                            
                            {aToken && (
                                <FlyoutLink
                                    title="Scan"
                                    onClick={handleScan}
                                />
                            )}
                            
                            {navItems.map((menu, index) => {
                                if (!menu.subMenu) {
                                    return (
                                        <FlyoutLink
                                            key={index}
                                            title={menu.title}
                                            path={menu.path}
                                        />
                                    );
                                }
                                return (
                                    <FlyoutLink
                                        key={index}
                                        title={menu.title}
                                        path={menu.path}
                                        FlyoutContent={() => (
                                            <MenuContent
                                                subMenu={menu.subMenu}
                                                navigate={navigate}
                                            />
                                        )}
                                    />
                                );
                            })}
                            
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                    className="text-white relative cursor-pointer text-sm sm:text-base px-4 py-2 bg-customRed rounded-md flex items-center hover:bg-opacity-80 transition-colors duration-200"
                                >
                                    {userRoleLabel}
                                    <ChevronDown className="ml-2 w-5 h-5" />
                                </button>
                                <AnimatePresence>
                                    {isUserDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 15 }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                            className="absolute right-0 mt-2 bg-white rounded-md shadow-lg w-40 py-2"
                                        >
                                            {(dToken || sToken ) && (
                                                <button
                                                    onClick={handleProfileNavigation}
                                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors duration-200 ease-in-out hover:scale-105"
                                                >
                                                    Profile
                                                </button>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors duration-200 ease-in-out hover:scale-105"
                                            >
                                                {signOutLabel}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </nav>
            )}
        </>
    );
});

Navbar.displayName = 'Navbar'; // Optional: Set a display name for debugging purposes

const FlyoutLink = ({ title, FlyoutContent, path, onClick }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {
        if (path) {
            navigate(path);
        }
        if (onClick) {
            onClick();
        }
    };

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className='relative w-fit h-fit'
        >
            <span
                onClick={handleClick}
                className='relative text-white cursor-pointer text-sm sm:text-base'
            >
                {title}
                <span
                    style={{
                        transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
                    }}
                    className='absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 sm:h-1 origin-left scale-x-0 rounded-full bg-customRed transition-transform duration-300 ease-out'
                />
            </span>
            <AnimatePresence>
                {isHovered && FlyoutContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        style={{ translateX: '-50%' }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className='absolute left-1/2 top-8 sm:top-12 text-black rounded-md shadow-lg'
                    >
                        <div className='absolute -top-6 left-0 right-0 h-6 bg-transparent' />
                        <div className='absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white' />
                        {FlyoutContent && <FlyoutContent />}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MenuContent = ({ subMenu, navigate }) => {
    return (
        <div className='w-48 sm:w-56 bg-white p-4 shadow-xl rounded-md'>
            {subMenu && subMenu.map((item, index) => (
                <a
                    key={index}
                    href='#'
                    onClick={(e) => {
                        e.preventDefault();
                        if (item.path) {
                            navigate(item.path);
                        } else if (item.action) {
                            item.action();
                        }
                    }}
                    className='block py-2 px-4 text-sm hover:bg-gray-100 rounded-md transition-colors duration-200 ease-in-out hover:scale-105'
                >
                    {item.name}
                </a>
            ))}
        </div>
    );
};

export default Navbar;