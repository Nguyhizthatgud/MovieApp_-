import React from 'react'
import { Divider } from "antd";
const Errorpage = () => {
    return (
        <section className="min-h-screen inset-0 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none flex flex-col justify-center items-center text-center p-4">
            <h1 className="text-2xl font-bold">Error: Toang rồi!</h1>
            <Divider />
            <p>Something went wrong. Please try again later.</p>
        </section>
    )
}

export default Errorpage
