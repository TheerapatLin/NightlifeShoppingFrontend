import React, { useEffect } from 'react';
//import ProductCardStyleOne3Image from "./Cards/ProductCardStyleOne3Image";
import ProductCardStyleOne3Image from './Cards/ProductCardStyleOne3Image';
import DataIteration from "./DataIteration";


export default function SectionStyleThree3Image({
  className,
  sectionTitle,
  seeMoreUrl,
  amount,
  layout = [],
  imageUrl,
  type
}) {

  useEffect(() => {
    //alert
    //alert("inside ----- " + JSON.stringify(products));
  }, [])

  return (
    <div className="container-x mx-auto" style={{ padding: '0px' }} >
      <div className="products-section w-full" style={{ borderRadius: "30px", padding: '0px' }}>
        <div className={`grid xl:grid-cols-${layout.layoutOption.bannerDisplayNumber ?? 3} lg:grid-cols-${layout.layoutOption.bannerDisplayNumber ?? 3} sm:grid-cols-2 grid-cols-1 xl:gap-[20px] gap-5`} >
          <DataIteration datas={layout.content} startLength={0} endLength={layout.layoutOption.bannerDisplayNumber ?? 3}>
            {({ datas }) => (
              < div data-aos="fade-up" className="item" >
                <ProductCardStyleOne3Image type={type} datas={datas} colNum={layout.layoutOption.bannerDisplayNumber ?? 3} layoutOption={layout.layoutOption} />
              </div>
            )}
          </DataIteration>
        </div>
      </div >
    </div >
  );
}
