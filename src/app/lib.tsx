const Lib = () => {
    return (
        <div className="grid grid-cols-2 gap-[10px] max-[400px]:grid-cols-1 max-[1024px]:grid-cols-1">
            <div className="col-span-1 h-[240px] max-[1024px]:h-[250px] bg-[#28282B] rounded-[8px] flex flex-col items-center gap-[20px] p-[30px]">
                <img className="w-[200px]" src="/npm.svg"></img>
                <p className="font-[bold] text-white text-[26px]">My Libraries</p>
                <div className="text-nowrap text-ellipsis overflow-hidden w-[320px] text-blue-500">
                    <a href="https://www.npmjs.com/package/playtwolinenotify" className="font-[regular] text-blue-500 cursor-pointer">https://www.npmjs.com/package/playtwolinenotify</a>
                </div>
            </div>

            <div className="col-span-1 h-[240px] bg-[#28282B] rounded-[8px] flex flex-col items-center gap-[20px] p-[30px]">
                <img className="w-[80px]" src="/github-white.svg"></img>
                <p className="font-[bold] text-white text-[26px]">My Repository</p>
                <div className="text-nowrap text-ellipsis overflow-hidden w-[320px] text-blue-500">
                    <a href="https://github.com/p1ay2invokio?tab=repositories" className="font-[regular] text-blue-500 cursor-pointer">https://github.com/p1ay2.14?tab=repositories</a>
                </div>
            </div>
        </div>
    )
}

export default Lib