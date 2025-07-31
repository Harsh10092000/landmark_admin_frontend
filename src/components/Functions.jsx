import React from 'react'
import moment from 'moment';

const Functions = () => {
  return (
    <div>
      
    </div>
  )
}


const PropertyTypeFunction = (val) => {
    return val?.split(",")[0];
  }




  export const priceFormat = (val) => {
    if (val < 100000) {
      return Intl.NumberFormat().format(val);
    } else if (val > 99999 && val < 10000000) {
      const lakh_number = val / 100000;
      return (
        lakh_number.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }) + " Lacs"
      );
    } else {
      const crore_number = val / 10000000;
      return (
          crore_number.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }) + " Crores"
      );
    }
  };
  
  
  export const ShowPrice = (pro_ad_type, pro_amt) => {
    return  pro_ad_type === "Sale" ? (
      "₹ " + priceFormat(pro_amt)
    ) : (
      <>
        ₹ {priceFormat(pro_amt)}
        <span className="slash-month d-block"> /month</span>
      </>
    )
  }
  
  export const DateFormat = (date) => {
    return  moment(date).format("DD MMM, YY");
  }

  export const PropertyCurrentStatus = ({ val, pro_url }) => {
    return (
      // <div>
      //   {val === 1 ? 
      //       <div className='property-status-wrapper property-status-green' >Listed</div> : 
      //       val === 0 ?
      //       <div className='property-status-wrapper property-status-gray' >Delisted</div> :
      //       val === 3 ?
      //       <div className='property-status-wrapper property-status-orange' >Expiring</div> :
      //       val === 4 ?
      //       <div className='property-status-wrapper property-status-red' >Expired</div> :
      //       val === 5 ?
      //       <div className='property-status-wrapper property-status-blue' >Sold Out</div> : ""
      //   }
      // </div>
      <div>
        {pro_url == null ? 
          <div className='property-status-wrapper property-status-orange' >Pending</div> :
          val === 1 ? 
            <div className='property-status-wrapper property-status-green' >Listed</div> : 
            val === 0 ?
            <div className='property-status-wrapper property-status-gray' >Delisted</div> :
            val === 3 ?
            <div className='property-status-wrapper property-status-orange' >Expiring</div> :
            val === 4 ?
            <div className='property-status-wrapper property-status-red' >Expired</div> :
            val === 5 ?
            <div className='property-status-wrapper property-status-blue' >Sold Out</div> : ""
        }
      </div>
    );
  };


  export default Functions
  export {PropertyTypeFunction}
  