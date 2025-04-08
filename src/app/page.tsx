'use client'

import NextImage from "next/image";
import { useAppContext } from "./index";
import { FaBookBookmark, FaFacebook, FaFolderOpen, FaInstagram, FaNodeJs } from "react-icons/fa6";
import { AiFillMessage, AiTwotoneCode } from "react-icons/ai";
import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area, ResponsiveContainer } from "recharts";
import { frame, motion, useMotionValueEvent } from 'framer-motion'
import { FaArrowUp } from "react-icons/fa6";
import { Suspense, useEffect, useRef, useState } from "react";
import { data, dataChart } from "./data";
import { banners } from "./banners";
import { useScroll } from "framer-motion"
import TimeLine from "./components/timeline";
import CustomAlert from "./components/customAlert";
import { LikeMessage, getAllComments } from "../../methods/comments/comments";
import { CommentsInterface } from "../../interfaces/commentsInterface";
import { BiLogoTypescript, BiSolidMessageSquareDetail } from "react-icons/bi";
import { IoIosHeartEmpty } from "react-icons/io";
import Footer from "./components/footer";
import { SiGmail } from "react-icons/si";
import { MdGTranslate } from "react-icons/md";
import { JsonRpcProvider, formatEther } from "ethers";
import { transactionSend } from "../../methods/blockchain/transaction";
import axios from 'axios'
import { URI } from "../../config";
import Lib from "./lib";
import Head from "next/head";
import { db } from "./firebase";
import { addDoc, collection, doc, getCountFromServer, getDocs, orderBy, query, updateDoc } from "firebase/firestore";

declare global {
  interface Window {
    ethereum: any
  }
}

// host ETH Hardhat
const provider = new JsonRpcProvider('https://eth.llamarpc.com')

export default function Home() {

  const { theme, setTheme, twoAlert, two } = useAppContext()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const projectRef = useRef<any>(null)

  const [radarHover, setRadarHover] = useState<boolean>(false)
  const [fireball, setFireball] = useState<boolean>(false)
  const [magic, setMagic] = useState<boolean>(false)
  const [nav, setNav] = useState<boolean>(false)

  const [translate, setTranslate] = useState<boolean>(false)

  const imgRef = useRef<any>(null)
  const scrollRef = useRef<any>(null)

  const [frame, setFrame] = useState(0)
  const [refresh, setRefresh] = useState(0)
  const frameCount = 75

  const { scrollY, scrollYProgress } = useScroll()

  const [apiSelect, setApiSelect] = useState(null)

  const bigRef = useRef<any>(null)

  // window.addEventListener("scroll", ()=>{
  //   const html = document.documentElement
  //   const fraction = html.scrollTop / (html.scrollHeight - window.innerHeight)
  //   const index = Math.min(frameCount - 1, Math.ceil(fraction * frameCount))
  //   console.log(index)
  //   setFrame(index)
  // })

  const resetScroll = () => {
    window.scrollTo(0, 0)
  }

  const [nft, setNft] = useState<boolean>(false)

  useMotionValueEvent(scrollYProgress, 'change', (last) => {
    const html = document.documentElement
    const fraction = html.scrollTop / (html.scrollHeight - window.innerHeight)
    const index = Math.min(frameCount - 1, Math.ceil(fraction * frameCount))
    index > 20 ? setFireball(true) : setFireball(false)
    index > 28 ? setMagic(true) : setMagic(false)
    index > 15 ? setNav(true) : setNav(false)
    index > 49 ? setNft(true) : null
    setFrame(index)
  })

  useEffect(() => {
    const img = new Image()
    const canvas = canvasRef.current
    img.onload = () => {
      if (canvas) {
        const context = canvas.getContext('2d')

        if (context) {
          context.fillRect(10, 10, context.canvas.width, context.canvas.height)
          context.drawImage(img, 0, 0)
        }
      }
    }
    img.src = `/sequence/d${frame}.png`
  }, [frame])

  const [comments, setComments] = useState<null | any>(null)
  const [wallet, setWallet] = useState<string | null>(null)
  const [acc, setAcc] = useState<string | null>(null)

  const initial = async () => {

    // MyServer
    // const comments = await getAllComments()

    // if (comments.status == 200) {
    //   setComments(comments.data)
    // }

    // Firebase DB
    const msgSnap = await getDocs(query(collection(db, 'messages'), orderBy('pid', 'desc')))
    const list = msgSnap.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data()
      }
    })

    setComments(list)
  }

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window?.ethereum) {
      try {
        const accounts: string[] = await window?.ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts && accounts.length > 0) {
          // localStorage.setItem("wallet_hex", accounts[0])
          const balanceWei = await provider.getBalance(accounts[0])
          const convertHEX = formatEther(balanceWei)
          console.log("Balance : ", convertHEX)
          setAcc(accounts[0])
          setWallet(convertHEX)
        }
      } catch {
        console.log("Logged Error")
      }
    } else {
      console.log("Metamask not detected")
    }
  }

  const [URL, setURL] = useState<{ path: string, method: string } | null>(null)

  const [output, setOutput] = useState<null | object[]>(null)

  const [modalMessage, setModalMessage] = useState<boolean>(false)
  const [sender, setSender] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  const SendingMessage = async (sender: string, message: string) => {

    let date = new Date()

    if (sender && message) {


      let snap = await getCountFromServer(collection(db, 'messages'))

      addDoc(collection(db, "messages"), {
        pid: snap.data().count + 1,
        username: sender,
        msg: message,
        likes: 1,
        timestamp: date.getTime()
      }).then(() => {
        setModalMessage(false)
        setRefresh(refresh + 1)
      })

    } else {
      alert("กรอกข้อมูลให้ครบก่อนค้าบ")
    }
  }

  const TestingApi = (endpoint: string, type: string): void => {
    axios.get(`${endpoint}`).then((res) => {
      setOutput(res.data)
    })
  }

  useEffect(() => {
    initial()
  }, [refresh])

  // let [mounted, setMounted] = useState<boolean>(false)

  // useEffect(() => {
  //   setMounted(true)
  // }, [])

  // if (!mounted) {
  //   return null;
  // }


  return (
    <div>

      {modalMessage ? <div onClick={(e) => {
        if (e.target == e.currentTarget) {
          setModalMessage(false)
        }
      }} className="bg-black/80 w-full h-[100vh] fixed top-0 left-0 z-[99] flex justify-center items-center">
        <div className="w-[300px] rounded-[8px] bg-white p-[10px] flex justify-center items-center flex-col">
          <p className="font-[kn-medium] text-[18px] text-center">กล่องจดหมาย 💌</p>
          <input onChange={(e) => {
            setSender(e.target.value)
          }} placeholder="ชื่ออะไรเอ่ย?" className="w-full outline-none indent-4 border-b-[2px] text-[14px] border-black/50 font-[kn-light] h-[40px] mt-[10px]"></input>
          <input onChange={(e) => {
            setMessage(e.target.value)
          }} placeholder="ข้อความ..." className="w-full outline-none indent-4 font-[kn-light] border-b-[2px] border-black/50 h-[40px] mt-[10px]"></input>

          <button className="w-full p-[10px] font-[kn-medium] bg-blue-500/80 text-white rounded-[8px] mt-[10px]" onClick={() => {
            SendingMessage(sender, message)
          }}>ส่งข้อความ</button>
        </div>
      </div> : null}

      {/* <motion.div ref={bigRef} initial={{ opacity: 1, pointerEvents: 'auto', zIndex: 99 }} animate={{ opacity: 0, pointerEvents: 'none', zIndex: -1 }} transition={{opacity: {delay: 5}, zIndex:{delay:5.1}}} className="w-full h-[100vh] bg-black/80 fixed top-0 left-0 flex justify-center items-center z-fade flex-col">
        <p className="font-[medium] text-[30px] text-white">WELCOME TO MY PORTFOLIO WEBSITE</p>
        <p className="font-[medium] text-[16px] text-white">something will happend until something move</p>
        <div className="w-[300px] h-[40px] bg-white flex justify-center items-center text-black mt-[20px] rounded-[4px] cursor-pointer">
          <p className="font-[medium]">move forward</p>
        </div>

        <img className="w-[50px] absolute top-[100px] left-[400px] transform scale-x-[-1]" src="./santa/star.webp"></img>

        <img className="w-[200px] absolute left-[200px] transform scale-x-[-1]" src="./santa/tworendeer.webp"></img>

        <img className="w-[200px] absolute right-[200px]" src="./santa/twosanta.webp"></img>

        <img className="w-[50px] absolute bottom-[100px] right-[400px] transform scale-x-[-1]" src="./santa/star.webp"></img>
      </motion.div> */}

      <div ref={scrollRef} className={`${theme == 'dark' ? 'bg-[#0e1111]' : 'bg-white'} duration-[0.5s]`}>
        <Head>
          <link rel="shortcut icon" href="/favicon.ico"></link>
        </Head>
        <motion.div initial={{ position: 'sticky', top: -60, left: 0 }} animate={nav ? { position: 'sticky', top: 0, left: 0 } : { position: 'sticky', top: -60, left: 0 }} className={`w-full h-[60px] bg-[#28282B] border-b-[5px] border-black/70 flex items-center justify-between p-[20px] z-[10]`}>
          {/* <div className="flex gap-[20px]">
          <p className="font-[medium] text-white text-[18px]">Explore</p>
          <p className="font-[medium] text-white text-[18px]">Work</p>
          <p className="font-[medium] text-white text-[18px]">Skills</p>
          <p className="font-[medium] text-white text-[18px]">Experience</p>
          <p className="font-[medium] text-white text-[18px]">Contact</p>
        </div> */}

          <div className="space-y-[-4px]" onClick={() => {
            resetScroll()
          }}>
            <p className="font-[medium] text-white text-[18px] cursor-pointer">p1ay2.14</p>
            <p className="font-[light] ml-[20px] text-white text-[12px] cursor-pointer">sungjintwo</p>
          </div>

          <div className="flex items-center gap-[20px]">
            {!acc ? <div onClick={() => {
              connectWallet()
            }} className="p-[10px] relative h-[35px] bg-white/80 rounded-[8px] flex justify-center items-center gap-[5px] cursor-pointer hover:bg-white duration-[0.2s]">
              <img src="/fox.png" className="w-[30px]"></img>
              <p className="font-[medium]">METAMASK</p>
              <div className="w-[15px] h-[15px] bg-green-600 rounded-full absolute right-[-5px] z-[1] top-[-5px]">
                <div className="w-[15px] h-[15px] bg-green-700 rounded-full animate-ping absolute right-[0px] z-[1] top-[0px]">

                </div>
              </div>
            </div> : <div className="flex flex-col items-end">
              <p className="font-[regular] text-white w-[200px] overflow-hidden text-ellipsis">{acc}</p>
              <p className="font-[light] text-white text-[14px]">{Number(wallet).toFixed(2)} ETH</p>
            </div>}

            <div onClick={() => {
              setTheme(theme == 'light' ? 'dark' : 'light')
            }} className={`w-[60px] h-[30px] ${theme == 'light' ? 'bg-green-600' : 'bg-gray-400'} rounded-full flex items-center relative cursor-pointer`}>
              <div className={`w-[45%] h-[80%] bg-white rounded-full absolute duration-[0.3s] flex justify-center items-center ${theme == 'light' ? 'left-7' : 'left-1'}`}>
                {theme == 'light' ? <img src="/sun.png" className="w-[20px]"></img> : <img src="/moon.png" className="w-[20px]"></img>}
              </div>
            </div>
          </div>
        </motion.div>

        <CustomAlert />

        {/* <TimeLine /> */}

        <main className={`w-full duration-[0.2s] p-[10px] flex gap-[10px] max-[760px]:flex-col`}>

          {/* LeftBar */}
          <div className="bg-[#28282B] w-[100%] rounded-[8px] p-[20px]">

            <div className="flex gap-[10px]">
              <div className="w-[120px] h-[120px] bg-blue-400/30 rounded-[8px] flex justify-center items-end">
                <motion.img transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }} animate={{ translateY: [0, 10, 0] }} alt="profile" src={'/profile/mee.webp'} className="w-[90px] h-[140px]"></motion.img>
              </div>
              <div className="flex flex-col justify-between">
                <div className="w-[120px]">
                  <p className="text-white font-[bold]">p1ay2.14</p>
                  <p className="text-white font-[light] text-[11px] mt-[5px]">Height: 176 cm</p>
                  <p className="text-white font-[light] text-[11px]">Weight: 119.05 lbs</p>
                  {/* <p className="font-[light] text-[14px] text-white mt-[5px]">wpm 71</p> */}
                </div>
                <div className="flex gap-[5px]">
                  <p className="text-gray-400 font-[medium]">WPM</p>
                  <p className="text-white font-[bold]">81 - 102</p>
                </div>
              </div>
            </div>

            <div className=" w-full h-[40px] bg-green-600/20 backdrop-blur-[5px] mt-[10px] rounded-[8px] flex justify-center items-center">
              <p className="font-[medium] text-green-600 text-[16px]">About Me</p>
            </div>


            <div className="border-b-[2px] border-gray-600 mt-[10px]"></div>


            <div className="mt-[10px]">
              <div className="flex gap-[5px] items-center">
                <p className="font-[medium] text-white">Education</p>
                <FaBookBookmark size={20} className="text-white" />
              </div>

              <div className="bg-blue-400/30 rounded-[8px] w-[70px] h-[30px] flex justify-center items-center mt-[10px]">
                <p className="font-[medium] text-blue-300">School</p>
              </div>

              <div className="flex gap-[10px] items-center">
                <NextImage className="w-[50px] h-[50px] mt-[10px] rounded-full" alt="logo" width={50} height={50} src={'/education/pattanavit.webp'}></NextImage>
                <div>
                  <p className="font-[regular] text-white text-[14px]">Grade 1 - 6</p>
                  <p className="font-[regular] text-white text-[14px]">Pattanavit Sueksa</p>
                </div>
              </div>

              <div className="flex gap-[10px] items-center">
                <NextImage className="w-[50px] h-[50px] mt-[10px] rounded-full" alt="logo" width={50} height={50} src={'/education/sanpatong.webp'}></NextImage>
                <div>
                  <p className="font-[regular] text-white text-[14px]">Grade 7 - 12</p>
                  <p className="font-[regular] text-white text-[14px]">Sanpatong Wittayakom</p>
                </div>
              </div>

              <div className="bg-blue-400/30 rounded-[8px] w-[100px] h-[30px] flex justify-center items-center mt-[10px]">
                <p className="font-[medium] text-blue-300">University</p>
              </div>

              <div className="flex gap-[10px] items-center mt-[10px]">
                <NextImage className="w-[50px] h-[50px] object-cover rounded-full" alt="logo" width={50} height={50} src={'/education/cmu.webp'}></NextImage>
                <div>
                  <p className="font-[regular] text-white text-[14px]">years 2nd</p>
                  <div>
                    <p className="font-[regular] text-white text-[14px]">Chiangmai University</p>
                    <p className=" text-white text-[14px] font-[kn-light]">สารสนเทศศึกษา</p>
                  </div>
                </div>
              </div>

              <div className="border-b-[2px] border-gray-600 mt-[20px]"></div>

              <div className="flex gap-[5px] items-center mt-[10px]">
                <p className="font-[medium] text-white">Languages</p>
                <AiTwotoneCode size={30} className="text-white" />
              </div>


              <div className="flex items-center justify-between">
                <div className="mt-[10px] bg-[#808080]/20 w-[90px] rounded-full h-[30px] flex justify-center items-center">
                  <p className="text-gray-400 text-[14px]">Javascript</p>
                </div>
                <p className="font-[light] text-white text-[14px]">Expert</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="mt-[10px] p-[5px] bg-[#808080]/20 w-[90px] rounded-full h-[30px] flex justify-center items-center">
                  <p className="text-gray-400 text-[14px]">Typescript</p>
                </div>
                <p className="font-[light] text-white text-[14px]">Expert</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="mt-[10px] p-[5px] bg-[#808080]/20 w-[80px] rounded-full h-[30px] flex justify-center items-center">
                  <p className="text-gray-400 text-[14px]">MySQL</p>
                </div>
                <p className="font-[light] text-white text-[14px]">Expert</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="mt-[10px] p-[5px] bg-[#808080]/20 w-[60px] rounded-full h-[30px] flex justify-center items-center">
                  <p className="text-gray-400 text-[14px]">C++</p>
                </div>
                <p className="font-[light] text-white text-[14px]">Expert</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="mt-[10px] p-[5px] bg-[#808080]/20 w-[80px] rounded-full h-[30px] flex justify-center items-center">
                  <p className="text-gray-400 text-[14px]">Python</p>
                </div>
                <p className="font-[light] text-white text-[14px]">Expert</p>
              </div>

            </div>

            <div className="border-b-[2px] border-gray-600 mt-[20px]"></div>

            <div className="mt-[20px] w-full h-[200px] sticky top-20 left-0 flex flex-col max-[760px]:hidden">
              <a href="#api" className="font-[regular] text-white">: API Portal</a>
              <a href="#youtube" className="font-[regular] text-white">: About Youtube</a>
              {/* <a href="#nft" className="font-[regular] text-white"></a> */}
            </div>


          </div>

          {/* RightSide */}

          <div className="flex-col max-[760px]:w-[100%] w-[calc(100%-300px)] flex gap-[10px]">
            <div className="w-full bg-[#28282B] rounded-[8px] flex justify-center items-center gap-[80px] max-[1024px]:flex-col max-[1024px]:gap-[20px] p-[20px]">

              <div>
                <RadarChart width={350} height={280} onMouseMove={() => {
                  setRadarHover(true)
                }} onMouseLeave={() => {
                  setRadarHover(false)
                }} outerRadius={90} data={data}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey={'subject'}></PolarAngleAxis>
                  <Radar className="duration-[0.3s] animate-pulse" dataKey={"A"} stroke="#8884d8" fill="#8884d8" fillOpacity={radarHover ? 0.8 : 0.6} />
                  {/* <Radar dataKey={"B"} stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} /> */}
                </RadarChart>
              </div>

              <div className="flex flex-col gap-[20px] w-[600px] max-[1024px]:w-[400px] max-[431px]:w-[300px]">
                <div>
                  <p className="font-[light] text-white">Endurance</p>
                  <div className=" w-[100%] h-[7px] bg-orange-400 rounded-full">
                    <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 2 }} className="bg-orange-700/70 h-full rounded-full"></motion.div>
                  </div>
                </div>
                <div>
                  <p className="font-[light] text-white">Multitask</p>
                  <div className=" w-[100%] max-[390px]:w-[300px] h-[7px] bg-red-400 rounded-full">
                    <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 2 }} className="bg-red-700/70 h-full rounded-full"></motion.div>
                  </div>
                </div>
                <div>
                  <p className="font-[light] text-white">Responsibility</p>
                  <div className=" w-[100%] h-[7px] bg-green-400 rounded-full">
                    <motion.div initial={{ width: 0 }} animate={{ width: '99%' }} transition={{ duration: 2 }} className="bg-green-700/70 h-full rounded-full"></motion.div>
                  </div>
                </div>
              </div>

            </div>

            <div className="h-[240px] bg-[#28282B] rounded-[8px] flex items-center gap-[50px] p-[30px] w-[100%]">
              {/* <div onClick={() => { 
              setTheme(theme == 'light' ? 'dark' : 'light')
            }} className={` w-[200px] h-[50px] rounded-full relative ${theme == 'light' ? 'bg-green-600' : 'bg-gray-400'}`}>
              <div className={`w-[40%] h-[80%] bg-white duration-[0.3s] rounded-full absolute top-1 ${theme == 'light' ? 'left-11' : 'left-1'}`}>

              </div>
            </div> */}
              {/* <div className="flex gap-[10px] relative">
              <div className="w-[300px] h-[180px] flex overflow-x-scroll snap-x snap-mandatory scroll-smooth gap-[10px] rounded-[8px]" ref={imgRef}>
                {banners && banners.length > 0 ? banners.map((item, index: number) => {
                  return (
                    <div key={index} className="w-full h-full flex-shrink-0 relative">
                      <NextImage src={item.src} alt="banner-img" width={1000} height={1000} className="snap-center w-full rounded-[8px] h-full object-cover"></NextImage>
                    </div>
                  )
                }) : null}
              </div>
              <div className="flex gap-[10px]">
                <div onClick={() => {
                  imgRef.current.scrollLeft -= 180
                }} className="w-[40px] h-[40px] bg-white/60 rounded-[8px] backdrop-blur-[5px] absolute top-[40%] trnaslate-y-[-50%] left-3 cursor-pointer flex justify-center items-center">
                  <FaArrowUp className="rotate-[-90deg]" size={22} />
                </div>
                <div onClick={() => {
                  imgRef.current.scrollLeft += 180
                }} className="w-[40px] h-[40px] bg-white/60 backdrop-blur-[5px] rounded-[8px] absolute top-[40%] trnaslate-y-[-50%] right-6 cursor-pointer flex justify-center items-center">
                  <FaArrowUp className="rotate-[90deg]" size={22} />
                </div>
              </div>
            </div> */}

              {/* <Canvas style={{ width: 200 }}>
              <ambientLight />
              <Cube />
              <OrbitControls enableZoom={false} enableRotate={false} />
            </Canvas> */}

              {/* <Canvas style={{ width: 230 }}>
              <ambientLight />
              <Wawa />
              <OrbitControls enableZoom={true} enableRotate={true} />
            </Canvas> */}

              {/* <div className="w-[3px] h-full bg-white/60 backdrop-blur-[5px] rounded-full max-[1024px]:hidden"></div> */}



              <div className="relative h-full w-full">

                <div onClick={() => {
                  projectRef.current.scrollLeft -= 220
                }} className="w-[30px] absolute left-[-40px] top-0 h-full bg-transparent cursor-pointer"></div>
                <div onClick={() => {
                  projectRef.current.scrollLeft += 220
                }} className="w-[30px] absolute right-[-40px] top-0 h-full bg-transparent cursor-pointer"></div>

                <div ref={projectRef} className="flex w-full h-full gap-[30px] overflow-x-scroll scroll-smooth items-center">



                  <motion.div whileHover={{ skewY: 0 }} initial={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0, skewY: -2 }} className="min-w-[200px] h-[95%] bg-white/20 backdrop-blur-[5px] rounded-[12px] skew-y-[-2deg] relative flex justify-center items-center">
                    <div className="w-full h-[30px] bg-white shadow-md rounded-[8px] flex justify-center items-center absolute top-0 border-b-[2px] border-blue-400">
                      <p className="font-[bold]">CMU HUMANITAS</p>
                    </div>

                    <NextImage alt="images not found." src={'/banners/humanitas.jpg'} width={500} height={500} className="w-full  h-full rounded-[8px] object-cover object-center"></NextImage>
                    {/* <p className="text-[14px] text-white">Images not found.</p> */}

                    <div onClick={() => {
                      window.location.href = "https://cmu-humanitas.vercel.app/"
                    }} className="absolute bottom-2 left-1/2 translate-x-[-50%] bg-blue-400/30 w-[80%] h-[30px] rounded-[8px] flex justify-center items-center hover:bg-blue-400/40 duration-[0.3s] cursor-pointer">
                      <p className="font-[medium] text-blue-400">Visit</p>
                    </div>

                  </motion.div>

                  <motion.div whileHover={{ skewY: 0 }} initial={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0, skewY: 3 }} className="min-w-[200px] h-[95%] bg-white/20 backdrop-blur-[5px] rounded-[12px]">
                    <div className="w-full h-[30px] bg-white shadow-md rounded-[8px] flex justify-center items-center absolute top-0 border-b-[2px] border-blue-400">
                      <p className="font-[bold]">Trading Board</p>
                    </div>

                    <NextImage alt="e-learning" src={'/trade.png'} width={200} height={200} className="w-full h-full rounded-[8px]"></NextImage>

                    <div onClick={() => {
                      alert("Project is not available to website!!")
                    }} className="absolute bottom-2 left-1/2 translate-x-[-50%] bg-blue-400/30 backdrop-blur-[5px] w-[80%] h-[30px] rounded-[8px] flex justify-center items-center hover:bg-blue-400/40 duration-[0.3s] cursor-pointer">
                      <p className="font-[medium] text-blue-400">Visit</p>
                    </div>

                  </motion.div>

                  <motion.div whileHover={{ skewY: 0 }} transition={{ delay: 0.1 }} initial={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0, skewY: -2 }} className="min-w-[200px] h-[95%] bg-white/20 backdrop-blur-[5px] rounded-[12px] skew-y-[-2deg] relative">
                    <div className="w-full h-[30px] bg-white shadow-md rounded-[8px] flex justify-center items-center absolute top-0 border-b-[2px] border-blue-400">
                      <p className="font-[bold]">Wanfah Lottery</p>
                    </div>

                    <NextImage alt="wanfah" src={'/banners/wanfah.png'} width={500} height={500} className="w-full h-full rounded-[8px] object-cover object-left-top"></NextImage>

                    <div onClick={() => {
                      window.location.href = "https://wanfah.online"
                    }} className="absolute bottom-2 left-1/2 translate-x-[-50%] bg-blue-400/30 w-[80%] h-[30px] rounded-[8px] flex justify-center items-center hover:bg-blue-400/40 duration-[0.3s] cursor-pointer">
                      <p className="font-[medium] text-blue-400">Visit</p>
                    </div>

                  </motion.div>

                  <motion.div whileHover={{ skewY: 0 }} transition={{ delay: 0.1 }} initial={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0, skewY: 2 }} className="min-w-[200px] h-[95%] bg-white/20 backdrop-blur-[5px] rounded-[12px] skew-y-[-2deg] relative">
                    <div className="w-full h-[30px] bg-white shadow-md rounded-[8px] flex justify-center items-center absolute top-0 border-b-[2px] border-blue-400">
                      <p className="font-[bold]">Wanfah SSL</p>
                    </div>

                    <NextImage alt="wanfah" src={'/banners/ssl.jpg'} width={500} height={500} className="w-full h-full rounded-[8px] object-cover"></NextImage>

                    <div onClick={() => {
                      window.location.href = "https://wanfahssl.vercel.app"
                    }} className="absolute bottom-2 left-1/2 translate-x-[-50%] bg-blue-400/30 w-[80%] h-[30px] rounded-[8px] flex justify-center items-center hover:bg-blue-400/40 duration-[0.3s] cursor-pointer">
                      <p className="font-[medium] text-blue-400">Visit</p>
                    </div>

                  </motion.div>


                  <Suspense fallback={<p className="text-white">Test</p>}>
                    <motion.div whileHover={{ skewY: 0 }} transition={{ delay: 0.2 }} initial={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0, skewY: 2 }} className="min-w-[200px] h-[95%] bg-white/20 backdrop-blur-[5px] rounded-[12px] skew-y-[2deg] relative">
                      <div className="w-full h-[30px] bg-white shadow-md rounded-[8px] flex justify-center items-center absolute top-0 border-b-[2px] border-blue-400">
                        <p className="font-[bold]">Stock Management</p>
                      </div>

                      <NextImage alt="stocks" src={'/banners/stocks.png'} width={500} height={500} className="w-full h-full rounded-[8px] object-cover object-left-top"></NextImage>

                      <div className="absolute bottom-2 left-1/2 translate-x-[-50%] bg-blue-400/30 w-[80%] h-[30px] rounded-[8px] flex justify-center items-center hover:bg-blue-400/40 duration-[0.3s] cursor-pointer">
                        <p className="font-[medium] text-blue-400">Visit</p>
                      </div>

                    </motion.div>
                  </Suspense>

                  <motion.div whileHover={{ skewY: 0 }} initial={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0, skewY: -2 }} className="min-w-[200px] h-[95%] bg-white/20 backdrop-blur-[5px] rounded-[12px] skew-y-[-2deg] relative">
                    <div className="w-full h-[30px] bg-white shadow-md rounded-[8px] flex justify-center items-center absolute top-0 border-b-[2px] border-blue-400">
                      <p className="font-[bold]">WhalePOS</p>
                    </div>

                    <NextImage alt="wanfah" src={'/banners/pos.jpg'} width={500} height={500} className="w-full h-full rounded-[8px] object-cover object-left-top"></NextImage>

                    <div onClick={() => {
                      alert("Project is not available to website!!")
                    }} className="absolute bottom-2 left-1/2 translate-x-[-50%] bg-blue-400/30 w-[80%] h-[30px] rounded-[8px] flex justify-center items-center hover:bg-blue-400/40 duration-[0.3s] cursor-pointer">
                      <p className="font-[medium] text-blue-400">Visit</p>
                    </div>

                  </motion.div>

                  <motion.div whileHover={{ skewY: 0 }} initial={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0, skewY: -2 }} className="min-w-[200px] h-[95%] bg-white/20 backdrop-blur-[5px] rounded-[12px] skew-y-[-2deg] relative flex justify-center items-center">
                    <div className="w-full h-[30px] bg-white shadow-md rounded-[8px] flex justify-center items-center absolute top-0 border-b-[2px] border-blue-400">
                      <p className="font-[bold]">Buddyfood</p>
                    </div>

                    <NextImage alt="images not found." src={'/banners/buddyfood.jpg'} width={500} height={500} className="w-full  h-full rounded-[8px] object-cover object-center"></NextImage>
                    {/* <p className="text-[14px] text-white">Images not found.</p> */}

                    <div onClick={() => {
                      window.location.href = 'https://www.youtube.com/@despondenthopeless2186'
                    }} className="absolute bottom-2 left-1/2 translate-x-[-50%] bg-blue-400/30 w-[80%] h-[30px] rounded-[8px] flex justify-center items-center hover:bg-blue-400/40 duration-[0.3s] cursor-pointer">
                      <p className="font-[medium] text-blue-400">Visit</p>
                    </div>

                  </motion.div>

                  <motion.div whileHover={{ skewY: 0 }} initial={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0, skewY: 2 }} className="min-w-[200px] h-[95%] bg-white/20 backdrop-blur-[5px] rounded-[12px] skew-y-[-2deg] relative flex justify-center items-center">
                    <div className="w-full h-[30px] bg-white shadow-md rounded-[8px] flex justify-center items-center absolute top-0 border-b-[2px] border-blue-400">
                      <p className="font-[bold]">Nightmarket Valorant</p>
                    </div>

                    <NextImage alt="images not found." src={'/banners/valorant.jpg'} width={500} height={500} className="w-full  h-full rounded-[8px] object-cover object-center"></NextImage>
                    {/* <p className="text-[14px] text-white">Images not found.</p> */}

                    <div onClick={() => {
                      window.location.href = 'https://play2valorant.netlify.app'
                    }} className="absolute bottom-2 left-1/2 translate-x-[-50%] bg-blue-400/30 w-[80%] h-[30px] rounded-[8px] flex justify-center items-center hover:bg-blue-400/40 duration-[0.3s] cursor-pointer">
                      <p className="font-[medium] text-blue-400">Visit</p>
                    </div>

                  </motion.div>

                  <motion.div onClick={() => {
                    alert("Project is not available to website!!")
                  }} whileHover={{ skewY: 0 }} initial={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0, skewY: 2 }} className="min-w-[200px] h-[95%] bg-white/20 backdrop-blur-[5px] rounded-[12px] skew-y-[-2deg] relative flex justify-center items-center">
                    <div className="w-full h-[30px] bg-white shadow-md rounded-[8px] flex justify-center items-center absolute top-0 border-b-[2px] border-blue-400">
                      <p className="font-[bold]">Car Detection</p>
                    </div>

                    {/* <NextImage alt="images not found." src={''} width={500} height={500} className="w-full  h-full rounded-[8px] object-cover object-left-top"></NextImage> */}
                    <p className="text-[14px] text-white">Images not found.</p>

                    <div className="absolute bottom-2 left-1/2 translate-x-[-50%] bg-blue-400/30 w-[80%] h-[30px] rounded-[8px] flex justify-center items-center hover:bg-blue-400/40 duration-[0.3s] cursor-pointer">
                      <p className="font-[medium] text-blue-400">Visit</p>
                    </div>

                  </motion.div>
                </div>
              </div>

            </div>

            <div className="bg-[#28282B] rounded-[8px] items-center max-[1024px]:flex-col max-[1024px]:gap-[20px] p-[20px]">
              <p className="font-[bold] mb-[10px] text-white text-[18px]">Inspiration Artwork</p>
              <div className="flex flex-row flex-nowrap gap-[20px] overflow-y-scroll">
                <div>
                  <NextImage className="min-w-[280px] h-[280px] rounded-[8px]" src={'/artworks/little.webp'} alt="artwork1" width={2000} height={2000}></NextImage>
                  <p className="font-[medium] text-white text-center mt-[10px]">HACIPUPU My Little Hero Series Figures</p>
                </div>
                <div>
                  <NextImage className="min-w-[280px] h-[280px] rounded-[8px]" src={'/artworks/boy.webp'} alt="artwork1" width={2000} height={2000}></NextImage>
                  <p className="font-[medium] text-white text-center mt-[10px]">HACIPUPU My Little Hero Series Figures</p>
                </div>
                <div>
                  <NextImage className="min-w-[280px] h-[280px] rounded-[8px]" src={'/artworks/art.webp'} alt="artwork1" width={2000} height={2000}></NextImage>
                  <p className="font-[medium] text-white text-center mt-[10px]">Azura Natural Elements Series</p>
                </div>
                <div>
                  <NextImage className="min-w-[280px] h-[280px] rounded-[8px]" src={'/artworks/skull.jpg'} alt="artwork1" width={2000} height={2000}></NextImage>
                  <p className="font-[medium] text-white text-center mt-[10px]">SKULLPANDA The Ink Plum Blossom Series Figures</p>
                </div>
              </div>
            </div>

            <Lib />

            {/* <div className="w-[100%] h-[240px] bg-[#28282B] rounded-[8px] flex items-center gap-[50px] p-[30px]"></div> */}

            {/* Image Sequence */}



            <div className="grid grid-cols-3 gap-[10px] max-[1024px]:grid-cols-2">

              <canvas ref={canvasRef} className="col-span-2 object-cover w-[100%] h-[350px] max-[390px]:w-[370px] max-[390px]:h-[270px] rounded-[8px]" width={1920} height={1080}></canvas>

              {/* <motion.div initial={{ opacity: 0 }} transition={{ duration: 0.3 }} animate={frame > 40 ? { opacity: 1 } : { opacity: 0 }} className="flex flex-col justify-center items-center w-full">
              <p className="font-[medium] text-[30px] text-white">CODING IS NOT DIFFERENT WITH</p>
              <p className="font-[light] text-[24px] text-white">THE MAGIC</p>
            </motion.div> */}

              <div className="col-span-1 max-[1024px]:col-span-2 h-full bg-[#28282B] rounded-[8px] p-[20px] flex flex-col relative">
                <div className="flex gap-[10px] items-center">
                  <p className="font-[medium] text-[16px] text-white">Comments</p>
                  <AiFillMessage size={20} className="text-white" />
                </div>

                <div className="h-[180px] overflow-scroll">
                  {comments && comments.length > 0 ? comments.map((item: { id: any, username: string, msg: string, timestamp: number, likes: number }, index: number) => {

                    let date = new Date(item.timestamp).toLocaleDateString("TH-th")

                    return (
                      <div key={index} className="flex text-black mt-[10px] flex-col w-full  bg-white rounded-[8px] justify-center p-[10px]">
                        <p className="font-[kn-medium]">ผู้ส่ง : {item.username}</p>
                        <p className="font-[kn-light] font-[14px]">{item.timestamp ? date : 'ไม่ระบุเวลา'}</p>
                        <div className="flex justify-between">
                          <p className="font-[kn-light] select-none">{item.msg}</p>
                          <div className="flex items-center gap-[5px]">
                            <IoIosHeartEmpty onClick={() => {
                              // LikeMessage(item.mid).then((res) => {
                              //   if (res.status == 200) {
                              //     setRefresh(refresh + 1)
                              //   }
                              // })

                              updateDoc(doc(db, 'messages', item.id), {
                                likes: item.likes + 1
                              }).then((res) => {
                                console.log("Updated")
                                setRefresh(refresh + 1)
                              })

                            }} size={15} className="cursor-pointer" />
                            <p className="font-[medium] text-[12px]">{item.likes} Likes</p>
                          </div>
                        </div>
                      </div>
                    )
                  }) : <p className="font-[kn-light] text-white/60 pointer-events-none select-none">Server is not responding.</p>}
                </div>

                <div className="flex mt-[10px] gap-[10px] items-center min-[390px]:hidden">
                  <p className="font-[light] text-white/60">Firebase Supported</p>
                  <img className="w-[20px]" src="./firebase-svgrepo-com.svg"></img>
                </div>

                <div onClick={() => {
                  setModalMessage(true)
                }} className="w-[100%] h-[40px] bg-white/20 rounded-[8px] bottom-2 flex items-center p-[10px] justify-between cursor-pointer mt-[20px]">
                  <p className="font-[kn-light] text-white/60 pointer-events-none select-none">เขียนอะไรซักหน่อยสิ!</p>
                  <BiSolidMessageSquareDetail size={20} className="text-white" />
                </div>
              </div>

            </div>

            <div className="max-[430px]:mt-[140px]">
              <ResponsiveContainer width={'100%'} height={300}>
                <AreaChart data={dataChart}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {/* <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="1" />
                <Tooltip /> */}
                  <Area type="monotone" dataKey="uv" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                  <Area type="monotone" dataKey="pv" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
                </AreaChart>

              </ResponsiveContainer>
            </div>

            <div id="api" className="flex gap-[10px] mt-[5px] max-[1024px]:flex-col">
              <div className="bg-[#28282B] rounded-[8px] p-[10px] w-full">

                <p className="font-[bold] text-white mb-[10px] text-center text-[20px]">API Portal</p>

                <div className="flex flex-col gap-[10px]">
                  <div onClick={() => {
                    setURL({ path: 'http://localhost:3001/api/product', method: "GET" })
                  }} className="flex items-center gap-[10px] bg-black/20 rounded-[8px] p-[5px]">
                    <div className="w-[60px] h-[30px] bg-green-500 rounded-[8px] flex justify-center items-center text-white">
                      <p className="font-[medium]">GET</p>
                    </div>
                    <p className="font-[light] text-white">/products</p>
                  </div>

                  <div className="flex items-center gap-[10px] bg-black/20 rounded-[8px] p-[5px]">
                    <div className="w-[60px] h-[30px] bg-green-500 rounded-[8px] flex justify-center items-center text-white">
                      <p className="font-[medium]">GET</p>
                    </div>
                    <p className="font-[light] text-white">/products/:id</p>
                  </div>

                  <div className="flex items-center gap-[10px] bg-black/20 rounded-[8px] p-[5px]">
                    <div className="w-[60px] h-[30px] bg-blue-600 rounded-[8px] flex justify-center items-center text-white">
                      <p className="font-[medium]">POST</p>
                    </div>
                    <p className="font-[light] text-white">/product</p>
                  </div>

                  <div className="flex items-center gap-[10px] bg-black/20 rounded-[8px] p-[5px]">
                    <div className="w-[60px] h-[30px] bg-blue-600 rounded-[8px] flex justify-center items-center text-white">
                      <p className="font-[medium]">PUT</p>
                    </div>
                    <p className="font-[light] text-white">/product/:id</p>
                  </div>

                  <div className="flex items-center gap-[10px] bg-black/20 rounded-[8px] p-[5px]">
                    <div className="w-[60px] h-[30px] bg-blue-600 rounded-[8px] flex justify-center items-center text-white">
                      <p className="font-[medium]">PATCH</p>
                    </div>
                    <p className="font-[light] text-white">/product/:id</p>
                  </div>

                  <div className="flex items-center gap-[10px] bg-black/20 rounded-[8px] p-[5px]">
                    <div className="w-[60px] h-[30px] bg-red-600 rounded-[8px] flex justify-center items-center text-white">
                      <p className="font-[medium]">DELETE</p>
                    </div>
                    <p className="font-[light] text-white">/product/:id</p>
                  </div>
                </div>
              </div>

              <div className="w-full bg-[#28282B] max-[1024px]:h-[300px] rounded-[8px] p-[10px]">
                <div className="bg-black/50 w-full h-full rounded-[8px] p-[10px] flex">
                  <div className="w-[250px] h-full border-r-[1px] border-gray-500 text-white text-[14px] gap-[10px] flex flex-col relative">
                    <div className="flex gap-[5px]">
                      <div className="w-[10px] h-[10px] bg-red-600 rounded-full"></div>
                      <div className="w-[10px] h-[10px] bg-yellow-600 rounded-full"></div>
                      <div className="w-[10px] h-[10px] bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <div className="flex gap-[5px] items-center">
                        <FaFolderOpen className="text-blue-400" size={15} />
                        <p>node_modules</p>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <BiLogoTypescript className="text-blue-600" size={15} />
                        <p>index.ts</p>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <FaNodeJs className="text-green-600/80" size={15} />
                        <p>package-lock.json</p>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <FaNodeJs className="text-green-600/80" size={15} />
                        <p>package.json</p>
                      </div>
                    </div>

                    <div onClick={() => {
                      if (URL) {
                        TestingApi(URL?.path, URL?.method)
                      } else {
                        alert("Please select endpoint!")
                      }
                    }} className="w-[95%] h-[35px] bg-purple-600 rounded-[8px] flex justify-center items-center font-[bold] text-[22px] absolute bottom-0">
                      <p>Send</p>
                    </div>

                  </div>

                  <div className="w-full h-full ml-[10px] relative">
                    <MdGTranslate onClick={() => {
                      setTranslate(!translate)
                    }} size={20} className="text-white absolute right-0 bottom-0 cursor-pointer z-[1] animate-pulse" />
                    {!translate ? <p className="font-[light] text-white">Greetings! This is "restful api testing" you can try to calling my API Service with SEND BUTTON or your own code.</p> : <p className="font-[kn-light] text-white">สวัสดีครับ! ในส่วนนี้เป็น "restful api testing" ทุกคนสามารถเรียก API โดยผ่านปุ่ม SEND หรือโค้ดของคุณเอง.</p>}

                    <div className="w-full bg-black/30 absolute bottom-0 p-[5px] rounded-[8px]">
                      {/* <p className="font-[light] text-white">{URL?.path ? URL.path : null}</p> */}
                      <div className="flex items-center gap-[5px]">
                        <p className="font-[light] text-white">output : </p>
                        <p className="font-[light] text-white">Server is not available</p>
                        {/* <pre className="font-[light] text-white">{JSON.stringify(output, null, 4)}</pre> */}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-center items-center mt-[10px] gap-[80px] bg-[#28282B] p-[20px] rounded-[8px] max-[1024px]:flex-col max-[1024px]:gap-[20px]">

              <div className="flex flex-col items-end">
                <p className="font-[bold] text-[20px] text-white">Sticker Line</p>
                <a target="_blank" className="text-blue-400 text-[14px] " href="https://store.line.me/stickershop/product/25620125/th">https://store.line.me/stickersh...</a>

                <p className="font-[kn-light] text-white text-[14px]">สติ๊กเกอร์ไลน์วาฬฟ้าสุดน่ารักแสดงความรู้สึก</p>
              </div>

              <div className="flex flex-col gap-[0px]">
                <div>
                  <NextImage width={500} height={150} alt="line" className="w-[500px] h-[150px] object-cover rounded-[8px] shadow-md shadow-white" src="/line_sticker.png"></NextImage>
                </div>
              </div>

            </div>


            <div className="w-full flex justify-center items-center gap-[70px] max-[1024px]:w-[200px] max-[1024px]:gap-[10px] max-[1024px]:justify-start max-[390px]:flex-col max-[390px]:items-center max-[390px]:justify-center max-[390px]:w-[100%]">
              <motion.img initial={{ translateY: 200, opacity: 0 }} animate={fireball ? { translateY: 0, opacity: 1 } : { translateY: 200, opacity: 0 }} src="/fireball5.png" className="w-[400px]"></motion.img>

              <div className="flex flex-col items-end">
                <p className="font-[bold] text-[20px] text-white">My Contact</p>
                {/* <a className="text-blue-400 text-[14px] " href="https://store.line.me/stickershop/product/25620125/th">https://store.line.me/stickersh...</a> */}

                <p className="font-[kn-light] text-white text-[14px]">ใช้สำหรับติดต่องานเขียนเว็บไซต์ & เขียนโปรแกรม</p>

                <div className="flex gap-[10px] text-white">
                  <FaFacebook size={20} />
                  <FaInstagram size={20} />
                  <SiGmail size={20} />
                </div>

                <a target="_blank" className="text-blue-400 mt-[20px] text-[14px]" href="https://www.facebook.com/Ratanon.Boonmata.PlayTwo">https://www.facebook.com/Ratano...</a>
              </div>
            </div>

            <div className="w-full flex justify-center items-center gap-[70px] min-[390px]:gap-[20px] ">

              <div className="flex flex-col items-end">
                <p className="font-[bold] text-[20px] text-white">Experiences</p>
                {/* <a className="text-blue-400 text-[14px] " href="https://store.line.me/stickershop/product/25620125/th">https://store.line.me/stickersh...</a> */}

                <div>
                  <p className="font-[kn-light] text-white text-[14px]">- Wanfah Company</p>
                  <p className="font-[kn-light] text-white text-[14px]">- Syncode Organization</p>
                  <p className="font-[kn-light] text-white text-[14px]">- Freelance Job 99+</p>
                </div>


                {/* <a target="_blank" className="text-blue-400 mt-[20px] text-[14px]" href="https://www.facebook.com/Ratanon.Boonmata.PlayTwo">https://www.facebook.com/Ratano...</a> */}
              </div>


              <motion.img initial={{ translateY: 200, opacity: 0 }} animate={magic ? { translateY: 0, opacity: 1 } : { translateY: 200, opacity: 0 }} src="/magic.png" className="w-[400px] max-[1024px]:w-[200px]"></motion.img>
            </div>


            <div id="youtube" className="w-full bg-transparent p-[10px] grid grid-cols-3 gap-[20px] place-items-center max-[1180px]:grid-cols-2 max-[1024px]:grid-cols-1">
              <div className="flex flex-col gap-[10px]">
                <div className="w-[350px] h-[200px] bg-[#28282B] rounded-[8px]">
                  <iframe width="100%" height="100%" className="rounded-[8px]" src="https://www.youtube.com/embed/PdbESvOAuIU?si=ciLprFZjPw7S4oDk" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
                </div>
                <div className="flex flex-col items-start space-y-[-2px]">
                  <p className="font-[kn-regular] text-white">เปิดพอร์ตสารสนเทศ มหาวิทยาลัยเชียงใหม่</p>
                  <p className="font-[kn-light] text-blue-400 text-[14px]">เพิ่มเติม</p>
                </div>
              </div>
              <div className="flex flex-col gap-[10px]">
                <div className="w-[350px] h-[200px] bg-[#28282B] rounded-[8px]">
                  <iframe width="100%" height="100%" className="rounded-[8px]" src="https://www.youtube.com/embed/2przKmhHq9E?si=ve8BzHD1d0KZKTga" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
                </div>
                <div className="flex flex-col items-start space-y-[-2px]">
                  <p className="font-[kn-regular] text-white">บทความการใช้งาน Github เบื้องต้น</p>
                  <p className="font-[kn-light] text-blue-400 text-[14px]">เพิ่มเติม</p>
                </div>
              </div>
              <div className="flex flex-col gap-[10px]">
                <div className="w-[350px] h-[200px] bg-[#28282B] rounded-[8px]">
                  <iframe width="100%" height="100%" className="rounded-[8px]" src="https://www.youtube.com/embed/jxH3uaIC3gM?si=aHFULxWP9OKy2SNd" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
                </div>
                <div className="flex flex-col items-start space-y-[-2px]">
                  <p className="font-[kn-regular] text-white">ดึง API ด้วย Python ใน 2 นาที</p>
                  <p className="font-[kn-light] text-blue-400 text-[14px]">เพิ่มเติม</p>
                </div>
              </div>
              <div className="flex flex-col gap-[10px]">
                <div className="w-[350px] h-[200px] bg-[#28282B] rounded-[8px]">
                  <iframe width="100%" height="100%" className="rounded-[8px]" src="https://www.youtube.com/embed/NIkp3iHIj9I?si=BzjrGCoKD3EK3p9A" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
                </div>
                <div className="flex flex-col items-start space-y-[-2px]">
                  <p className="font-[kn-regular] text-white">React + Electron สร้าง Desktop App</p>
                  <p className="font-[kn-light] text-blue-400 text-[14px]">เพิ่มเติม</p>
                </div>
              </div>
              <div className="flex flex-col gap-[10px]">
                <div className="w-[350px] h-[200px] bg-[#28282B] rounded-[8px]">
                  <iframe width="100%" height="100%" className="rounded-[8px]" src="https://www.youtube.com/embed/8Zvk5h_VPuM?si=Hqs6uZEFpmPLmqNd" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
                </div>
                <div className="flex flex-col items-start space-y-[-2px]">
                  <p className="font-[kn-regular] text-white">แนะนำเครื่องมือเขียนโปรแกรมที่ดีที่สุด</p>
                  <p className="font-[kn-light] text-blue-400 text-[14px]">เพิ่มเติม</p>
                </div>
              </div>
              <div className="flex flex-col gap-[10px]">
                <div className="w-[350px] h-[200px] bg-[#28282B] rounded-[8px]">
                  <iframe width="100%" height="100%" className="rounded-[8px]" src="https://www.youtube.com/embed/1VDIGd5bxgo?si=rkKAdEkPuKbjVutE" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
                </div>
                <div className="flex flex-col items-start space-y-[-2px]">
                  <p className="font-[kn-regular] text-white">UseMemo คืออะไร ?</p>
                  <p className="font-[kn-light] text-blue-400 text-[14px]">เพิ่มเติม</p>
                </div>
              </div>

              <div className="flex flex-col gap-[10px]">
                <div className="w-[350px] h-[200px] bg-[#28282B] rounded-[8px]">
                  <iframe width="100%" height="100%" className="rounded-[8px]" src="https://www.youtube.com/embed/0nV33WpmZu4?si=Ndvbb2OidDAsqQPm" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
                </div>
                <div className="flex flex-col items-start space-y-[-2px]">
                  <p className="font-[kn-regular] text-white">Python list, tuple ภายใน 5 นาที</p>
                  <p className="font-[kn-light] text-blue-400 text-[14px]">เพิ่มเติม</p>
                </div>
              </div>

              <div className="flex flex-col gap-[10px]">
                <div className="w-[350px] h-[200px] bg-[#28282B] rounded-[8px]">
                  <iframe width="100%" height="100%" className="rounded-[8px]" src="https://www.youtube.com/embed/91r4OKpoBlw?si=lGhpiSYhVgsJDVBO" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
                </div>
                <div className="flex flex-col items-start space-y-[-2px]">
                  <p className="font-[kn-regular] text-white">This is way to get free SSL</p>
                  <p className="font-[kn-light] text-blue-400 text-[14px]">เพิ่มเติม</p>
                </div>
              </div>

              <div className="flex flex-col gap-[10px]">
                <div className="w-[350px] h-[200px] bg-[#28282B] rounded-[8px]">
                  <iframe width="100%" height="100%" className="rounded-[8px]" src="https://www.youtube.com/embed/nK0bjx7ZgHo?si=4pr2C03B--_ahBRX" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
                </div>
                <div className="flex flex-col items-start space-y-[-2px]">
                  <p className="font-[kn-regular] text-white">EXPORT MSSQL SERVER</p>
                  <p className="font-[kn-light] text-blue-400 text-[14px]">เพิ่มเติม</p>
                </div>
              </div>

            </div>


            {/* <div id="nft" className="w-full h-[60px] bg-transparent flex justify-center items-center mt-[50px]">
            <div className="flex flex-col items-center">
              <p className="font-[medium] text-white text-[20px]">STEP TO WEBSITE 3.0</p>
              <p onClick={() => {

              }} className="font-[light] text-white text-[16px]">BUY NFT</p>
            </div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={nft ? { opacity: 1, translateY: 0 } : { opacity: 0, translateY: 50 }} className="w-full p-[10px] gap-[60px] flex justify-center items-center mt-[50px] max-[1024px]:flex-col">
            <div>
              <div className="w-[300px] h-[400px] bg-red-600">
                <NextImage alt="cat" src="/whales/cat3.jpg" width={300} height={400} className="w-full h-full object-cover"></NextImage>
              </div>
              <div className="flex flex-col gap-[10px] mt-[20px]">
                <div>
                  <p className="font-[light] text-white w-[180px] overflow-hidden text-ellipsis">0xd9bfE7d4BB81A0F26a89525217E344b73F29a64D</p>
                  <p className="font-[medium] text-white text-[18px]">0.035 ETH</p>
                </div>
                <div className="w-[130px] h-[35px] bg-green-700 flex justify-center items-center rounded-[8px]">
                  <p className="text-white font-[medium]">Buy NFT</p>
                </div>
              </div>
            </div>
            <div>
              <div className="w-[300px] h-[400px] bg-red-600">
                <NextImage alt="cat" src="/whales/cat1.jpg" width={300} height={400} className="w-full h-full object-cover"></NextImage>
              </div>
              <div className="flex flex-col gap-[10px] mt-[20px]">
                <div>
                  <p className="font-[light] text-white w-[180px] overflow-hidden text-ellipsis">0xd9bfE7d4BB81A0F26a89525217E344b73F29a64D</p>
                  <p className="font-[medium] text-white text-[18px]">0.035 ETH</p>
                </div>
                <div className="w-[130px] h-[35px] bg-green-700 flex justify-center items-center rounded-[8px]">
                  <p className="text-white font-[medium]">Buy NFT</p>
                </div>
              </div>
            </div>
            <div>
              <div className="w-[300px] h-[400px] bg-red-600">
                <NextImage alt="cat" src="/whales/cat2.jpg" width={300} height={400} className="w-full h-full object-cover"></NextImage>
              </div>
              <div className="flex flex-col gap-[10px] mt-[20px]">
                <div>
                  <p className="font-[light] text-white w-[180px] overflow-hidden text-ellipsis">0xd9bfE7d4BB81A0F26a89525217E344b73F29a64D</p>
                  <p className="font-[medium] text-white text-[18px]">0.035 ETH</p>
                </div>
                <div className="w-[130px] h-[35px] bg-green-700 flex justify-center items-center rounded-[8px]">
                  <p className="text-white font-[medium]">Buy NFT</p>
                </div>
              </div>
            </div>
          </motion.div> */}

          </div>

        </main>

        <Footer />

      </div>
    </div>
  );
}
