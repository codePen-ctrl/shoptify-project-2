import React, { useEffect, useState } from "react";
import logo from "../assets/shoptify.png";
import { useUserInfo } from "../hooks/useUserInfo";
import { AvatarPage } from "../components/Avatars";
import { Button } from "../components/Button";
import { AlertTriangle, CheckCheck, Database, MoonStar, Pencil, SunMedium, Trash, Trash2, User, UserCheck, UserX } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import {Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import { Input } from "../components/Input";
import profile from "../assets/post.png";
import { useApi } from "../hooks/useApi";
import { AlertBox } from "../components/AlertBoxes";
import not_found_img from "../assets/notFound.jpg";
import { useNavigate } from "react-router-dom";

const MemoButton = React.memo(Button)

const Header = React.memo(()=>{
    const {Theme, ChangeTheme} = useTheme();
    const {Avatar} = useUserInfo();

    return <div className="header">
                <img className="logo" src={logo} alt="loading...." />
                <section
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                    }}
                >
                    <MemoButton onlyIcon={true} variant="outline" size="sm" onClick={ChangeTheme}>
                        {Theme == 'dark' ? <MoonStar size={15} strokeWidth={3}/> : <SunMedium size={18} strokeWidth={3}/>}
                    </MemoButton>
                    <AvatarPage image={Avatar}/>
                </section>
           </div>
})

const UserCard = React.memo(()=>{
    const navigate = useNavigate();

    const {
        Username,
        Email,
        Avatar,
        Phone
    } = useUserInfo();

    return <div className="user_card">
             <MemoButton onClick={()=>navigate('/editProfile')} variant="success" size="sm" style={{position: 'absolute', right: '15px', top: '15px'}}><Pencil size={12} strokeWidth={3}/> Edit</MemoButton>
             <AvatarPage image={Avatar} size="clamp(100px, 10vw, 120px)" style={{border: '1px solid var(--border)'}}/>
             <div className="info">
                <span className="title">Welcome Back, <span className="name">{Username}</span></span>
                <span className="email">{Email}</span>
                <span className="email">{Phone || "Unknown"}</span>
             </div>
           </div>
})

const StatusCard = React.memo(({icon=null, title="Card Title", value='0000', color=null, checked=false, onClick=()=>{}})=>{


    return <div onClick={onClick} className="status_card" style={{'--selected-color': color}}>
            { checked &&
                <div className="checked">
                    <CheckCheck size={13} strokeWidth={3}/>
                </div>
            }

            <section>
                <span className="icon">{icon}</span>
                <span className="title">{title}</span>
            </section>

            <div className="value">{value}</div>
           </div>
})

const UserList = React.memo(({ image=null, name="Shop Name", createdAt="10-4-26", location=null, phone=null, ban=false, onBan=()=>{}, onUnban=()=>{}, onDelete=()=>{}})=>{

    const src = image ? image : profile;

    return <div className="user">
                <img src={src} alt="loading..."/>
                <div className="info">
                    <span className="name">{name}</span>
                    <span className="createdAt">created at {createdAt}</span>
                    <span className="location">{location ? location : 'No location found'}</span>
                    <span className="phone">{phone ? phone : 'Unknown'}</span>
                </div>
                <div className="btn_hold">
                    { !ban ?
                        <MemoButton size="sm" onClick={onBan}>Ban</MemoButton> :
                        <MemoButton size="sm" onClick={onUnban}>Unban</MemoButton>
                    }
                    <MemoButton size="sm" variant="danger" onlyIcon={true} onClick={onDelete}>
                        <Trash2 size={16}/>
                    </MemoButton>
                </div>
           </div>
})

const NoUserFound = React.memo(()=>{
        return <div className="noUser_page">
                    <img src={not_found_img} alt="loading..." />
                    <span className="title">User not found</span>
                    <span className="desc">No users match your search.<br/>Try adjusting your search keyword.</span>
               </div>
    })

export const Dashboard = React.memo(()=>{
    const [select, setSelect] = useState('chart');
    const [option, setOption] = useState('total-users');
    const [year, setYear] = useState(new Date().getFullYear());
    const [userList, setUserList] = useState([]);
    const [selected_users, setSelected_users] = useState(userList || []);
    const [reload, setReload] = useState(false);
    const iconSize = 20;
    const {postAPI, getAPI} = useApi();
    const {Token, SetExpire} = useUserInfo();
    const [chart_data, setChat_data] = useState([]);
    const [value, setValue] = useState({totalUsers: 0, totalData: '0 Mb', liveUsers: 0, expiredUsers: 0});
    const [noti, setNoti] = useState(null);
    const [id, setId] = useState(null);
    const navigator = useNavigate();

    const handleBanNoti = (id)=>{
        setId(id);
        setNoti('ban-noti')
    }

    const handleUnbanNoti = (id)=>{
        setId(id);
        setNoti('unban-noti')
    }

    const handleDeleteNoti = (id)=>{
        setId(id);
        setNoti('delete-noti')
    }

    const handleBan = async ()=>{
        const data = await getAPI({
            endpoint: `/admin/banUser?token=${Token}&id=${id}`
        })
        if(data.expired) SetExpire(data.expired);
        if(data.success){ 
            setNoti(null)
            setReload(prep=>!prep)
        }
    }

    const handleUnban = async ()=>{
        const data = await getAPI({
            endpoint: `/admin/unbanUser?token=${Token}&id=${id}`
        })
        if(data.expired) SetExpire(data.expired);
        if(data.success){ 
            setNoti(null)
            setReload(prep=>!prep)
        }
    }

    const handleDelete = async ()=>{
        const data = await getAPI({
            endpoint: `/admin/deleteUser?token=${Token}&id=${id}`
        })
        if(data.expired) SetExpire(data.expired);
        if(data.success){ 
            setNoti(null)
            setReload(prep=>!prep)
        }
    }

    const statusCards = [
                    {icon: <User size={iconSize}/>, title: 'Total Users', value: value.totalUsers, color: "var(--accent-1)", checked: option == "total-users", onClick: ()=>{setOption('total-users')}},
                    {icon: <Database size={iconSize}/>, title: 'Total Data', value: value.totalData, color: "var(--data-btn)", checked: option == "total-data", onClick: ()=>{setOption('total-data')}},
                    {icon: <UserCheck size={iconSize}/>, title: 'Live Users', value: value.liveUsers, color: "var(--live-btn)", checked: option == "live-users", onClick: ()=>{setOption('live-users')}},
                    {icon: <UserX size={iconSize}/>, title: 'Ban Users', value: value.expiredUsers, color: "var(--expired-btn)", checked: option == "ban-users", onClick: ()=>{setOption('ban-users')}}
                ]

    useEffect(()=>{
        const fetchData = async ()=>{
            const data = await getAPI({
                endpoint: `/admin/stats?token=${Token}`
            });
            if(data.expired) SetExpire(data.expired);

            if(data.success){
                setValue({
                    totalUsers: data.data.totalUsers,
                    totalData: data.data.totalData, 
                    liveUsers: data.data.liveUsers, 
                    expiredUsers: data.data.expiredUsers
                })
            }
        }
        fetchData()
    },[reload, Token])

    const [years, setYears] = useState([]);

    useEffect(()=>{
        const tempYears = [];
        let now_year = 2020;
        const date = new Date();
        let last_year = date.getFullYear();

        while(now_year <= last_year){
            tempYears.push(now_year);
            now_year++;
        }
        setYears(tempYears);
    },[])

    useEffect(()=>{
        if(select != "chart") return;

        const fetchData = async ()=>{
            const data = await postAPI({
                endpoint: `/admin/chart?token=${Token}`,
                body: {
                    year,
                    type: option
                }
            })

            if(data.expired) SetExpire(data.expired);

            if(data.success){
                const array = [];
                for (let month in data.data) {
                    const value = data.data[month];
                    array.push({month: month, data: value});
                }
                setChat_data(array);
            }
        }
        fetchData()
    },[year, option, select, reload])

    useEffect(()=>{
        if(select != 'list') return;
        
        const endpoint = option == "total-users" && 'allUsers' || 
                         option == "total-data" && 'allUsers' || 
                         option == "live-users" && 'liveUsers' || 
                         option == "ban-users" && 'banUsers';

        const fetchData = async ()=>{
            const data = await getAPI({
                endpoint: `/admin/${endpoint}?token=${Token}`,
                body: {
                    year,
                    type: option
                }
            })

            if(data.expired) SetExpire(data.expired);
            
            if(data.success){
                console.log(data.data)
                setUserList(data.data || []);
            }
        }
        fetchData()
    },[select, option, reload])

    useEffect(() => {
        setSelected_users(userList || []);
    }, [userList]);

    const handleSearch = (value) => {
        if (!value) {
            setSelected_users(userList);
            return;
        }

        const filtered = userList.filter(user =>
            user.username.toLowerCase().includes(value.toLowerCase())
        );

        setSelected_users(filtered);
    };


    return <div className="dashboard">
                {
                    noti && <div className="notification">
                        {
                            noti == 'ban-noti' && <AlertBox 
                                                    title="Banning Alert"
                                                    type="error"
                                                    description="Are you sure to ban this user?"
                                                    titleIcon={{
                                                        icon: <AlertTriangle/>
                                                    }}
                                                  >
                                                     <MemoButton variant="danger" onClick={handleBan}>Ban Now</MemoButton>
                                                     <MemoButton variant="default" onClick={()=>setNoti(null)}>Cancle</MemoButton>
                                                  </AlertBox>
                        }
                        
                        {
                            noti == 'unban-noti' && <AlertBox 
                                                    title="Unban Alert"
                                                    type="info"
                                                    description="Are you sure to unban this user?"
                                                    titleIcon={{
                                                        icon: <AlertTriangle/>
                                                    }}
                                                  >
                                                     <MemoButton variant="success" onClick={handleUnban}>Unban Now</MemoButton>
                                                     <MemoButton variant="default" onClick={()=>setNoti(null)}>Cancle</MemoButton>
                                                  </AlertBox>
                        }

                        {
                            noti == 'delete-noti' && <AlertBox 
                                                    title="Delete Alert"
                                                    type="error"
                                                    description="Are you sure to delete this user? You cannot undo if you done."
                                                    titleIcon={{
                                                        icon: <Trash2/>
                                                    }}
                                                  >
                                                     <MemoButton variant="danger" onClick={handleDelete}>Delete Now</MemoButton>
                                                     <MemoButton variant="default" onClick={()=>setNoti(null)}>Cancle</MemoButton>
                                                  </AlertBox>
                        }
                    </div>
                }

                <Header/>
                <UserCard/>
                <div className="status_holder">
                    {
                        statusCards.map((card, i)=><StatusCard key={i} icon={card.icon} title={card.title} value={card.value} color={card.color} checked={card.checked} onClick={card.onClick}/>)
                    }
                </div>

                <div className="btn_holder">
                    <MemoButton size="sm" variant={select == 'chart' ? "primary" : "outline-gradient"} onClick={()=>setSelect('chart')}>Data Chart</MemoButton>
                    <MemoButton size="sm" variant={select == 'list' ? "primary" : "outline-gradient"} onClick={()=>setSelect('list')}>Data List</MemoButton>
                    <MemoButton size="sm" variant="success" onClick={()=>navigator('/addUser')}>Add User</MemoButton>
                    <MemoButton size="sm" variant="success" onClick={()=>navigator('/addAdmin')}>Add Admin</MemoButton>
                </div>

                { select == "chart" &&
                    <div className="chart_container">
                        <span className="title">{option}</span>

                        <select onChange={(e)=>setYear(e.target.value)}>
                            {years.map((year, i)=><option selected={year == new Date().getFullYear()} value={year}>{year}</option>)}
                        </select>

                        <ResponsiveContainer className="chart" width="100%" height="100%">
                            <AreaChart data={chart_data}>
                                <YAxis/>
                                <XAxis dataKey="month"/>
                                <CartesianGrid strokeDasharray="5 5"/>
                                <Tooltip itemStyle={{color: option == "total-users" && 'var(--accent-1)' ||
                                                            option == "total-data" && 'var(--data-btn)' ||
                                                            option == "live-users" && 'var(--live-btn)' ||
                                                            option == "ban-users" && 'var(--expired-btn)' 
                                }}/>
                                <Area 
                                    type="monotone" 
                                    dataKey="data"
                                    fill={option == "total-users" && 'var(--accent-1)' ||
                                          option == "total-data" && 'var(--data-btn)' ||
                                          option == "live-users" && 'var(--live-btn)' ||
                                          option == "ban-users" && 'var(--expired-btn)' }
                                    stroke="var(--bg-main)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                }

                { select == "list" &&
                    <div className="user_list">
                        <span className="title">{option}</span>
                        <Input iconSize={15} type="search" placeholder="Enter Username" style={{margin: '10px'}} onSearch={handleSearch}/>
                   
                        <div className="user_table">
                            {
                                selected_users.length > 0 && selected_users.map((user, i)=><UserList key={i}
                                                                        image={user.avatar}
                                                                        id={user.id}
                                                                        name={user.username} 
                                                                        createdAt={user.created_at}
                                                                        location={user.location}
                                                                        phone={user.phone}
                                                                        ban={user.ban == 0 ? false : true}
                                                                        onBan={()=>handleBanNoti(user.id)}
                                                                        onUnban={()=>handleUnbanNoti(user.id)}
                                                                        onDelete={()=>handleDeleteNoti(user.id)}
                                                                    />)
                            }

                            {
                                selected_users.length < 1 && <NoUserFound/>
                            }
                        </div>
                    </div>
                }
                
           </div>

})