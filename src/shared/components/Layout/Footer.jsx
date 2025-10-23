import React from "react";
import LiveTV from "../../../assets/LiveTV.svg";
const FooterLayout = () => {
    return (
        <section className="relative flex justify-center mx-auto w-full">
            <div className="container flex flex-col md:flex-row justify-between items-start gap-6 py-6 px-6 md:px-12 border-t border-gray-800">
                <div className="w-full my-auto !mt-3">
                    <div className="flex items-center gap-3">
                        <img src={LiveTV} alt="Logo" className="h-8" />
                        <div>
                            <div className="text-lg font-semibold text-white">MovieApp - 时间如水</div>
                            <div className="text-sm text-gray-400">Educational Project • Portfolio Demo</div>
                        </div>
                    </div>

                    <div className="w-full mt-4">
                        <div className="text-md text-gray-500">
                            &copy; {new Date().getFullYear()} MovieApp - 时间如水 • Not for commercial use
                        </div>
                        <div className="text-xs text-gray-600 mt-2 font-medium">
                            Created by <span className="text-blue-400 font-semibold">nguyhizthatgud</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6 items-end w-full !mt-3">
                    <nav aria-label="Footer navigation" className="flex gap-6 text-sm">
                        <a href="#home" className="text-gray-300 hover:text-white transition-colors">Home</a>
                        <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                        <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
                        <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
                    </nav>

                    <div className="text-xs text-gray-400 gap-4 flex flex-col md:flex-row items-start md:items-end">
                        <div className="mb-1">
                            🎓 <strong>Educational Purpose:</strong> Built for learning React, Context API, and modern web development
                        </div>
                        <div className="mb-2">
                            💼 <strong>Portfolio Project:</strong> Demonstrating frontend skills and best practices
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="">    <a
                                href="https://github.com/your-username/movieapp"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="View source code on GitHub"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M12 .5a12 12 0 00-3.8 23.4c.6.1.8-.2.8-.5v-2c-3.3.7-4-1.6-4-1.6-.5-1.2-1.3-1.5-1.3-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.6.7 2 .9.1-.7.4-1 .7-1.2-2.6-.3-5.3-1.3-5.3-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.4 0 0 1-.3 3.4 1.2a11.6 11.6 0 016.2 0C18 5 19 5.3 19 5.3c.6 1.8.2 3.1.1 3.4.8.9 1.2 2 1.2 3.2 0 4.6-2.7 5.6-5.3 5.9.4.3.7.9.7 1.9v2.8c0 .3.2.6.8.5A12 12 0 0012 .5z" />
                                </svg>
                            </a></div>
                            <div>
                                <a
                                    href="https://www.linkedin.com/in/your-profile"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Connect on LinkedIn"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M4.98 3.5a2.5 2.5 0 11-.001 5.001A2.5 2.5 0 014.98 3.5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-.9 1.8-1.8 3.6-1.8 3.8 0 4.5 2.5 4.5 5.8V21H18v-5.1c0-1.2 0-2.8-1.7-2.8-1.7 0-2 1.4-2 2.7V21H9z" />
                                    </svg>
                                </a>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </section>

    );
};

export default FooterLayout;