import '../App.css'
import React, {useState, useEffect} from 'react'
import '../styles/Navbar.css'
import * as Io5Icons from 'react-icons/io5'

const Navbar = () => {
    const [time, setTime] = useState('');
    const [date, setDate] = useState ('');

    useEffect(() => {
        const dateTime = () => {
            const date = new Date();
            const dateOptions = {year:'numeric', month:'numeric', day:'numeric'};
            const timeOptions = {hour: '2-digit', minute: '2-digit',  hour12: true};

            setDate(date.toLocaleDateString('es-Es', dateOptions));
            setTime(date.toLocaleTimeString('es-Es', timeOptions));
        };

        dateTime();
        const interval = setInterval(dateTime, 1000);

        return () => clearInterval(interval);
    }, []);

  return (
    <>
        <div className='contentNavbar'>
            <div className='dateTimeBox'>
                <div className='dateBox'>
                    <Io5Icons.IoCalendar className='iconCalendar' />
                    <span className='time'>{date}</span>
                </div>
                <div className='timeBox'>
                    <Io5Icons.IoTime className='iconTime' />
                    <span className='time'>{time}</span>
                </div>
            </div>
        </div> 
    </>
  );
}

export default Navbar;
