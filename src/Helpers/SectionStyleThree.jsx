import React, { useEffect } from 'react';
import ProductCardStyleOne from "./Cards/ProductCardStyleOne";
import DataIteration from "./DataIteration";
import ViewMoreTitle from "./ViewMoreTitle";

export default function SectionStyleThree({
  className,
  sectionTitle,
  seeMoreUrl,
  amount,
  products = [],
  layoutOption,
  type,
  slug
}) {

  useEffect(() => {
    //alert("inside ----- " + JSON.stringify(layoutOption));
  }, [])


  return (
    <div className={`section-style-one ${className || ""}`} style={{ padding: '0px', margin: '0px' }} >

      <ViewMoreTitle categoryTitle={""} seeMoreUrl={seeMoreUrl} style={{ padding: '0px', margin: '0px' }}>
        <div className="products-section w-full" style={{ borderRadius: "30px", padding: '0px', margin: '0px', display: (layoutOption?.is3LineHeaderText ?? false) ? 'flex' : 'null', flexDirection: 'row' }}>
          {(layoutOption?.is3LineHeaderText ?? false) && (layoutOption?.isLeftOrRight == 0) ?
            <div style={{
              minWidth: '28%', maxWidth: '28%', flexDirection: 'column', display: (layoutOption?.is3LineHeaderText ?? false) ? 'flex' : 'none',
            }}>
              <div style={{ fontSize: '22px' }}>{layoutOption?.line1Text}</div>
              <div style={{ fontSize: '120px' }}>{layoutOption?.line2Text}</div>
              <div style={{ fontSize: '20px' }}>{layoutOption?.line3Text}</div><br />
              <div>
                <button style={{
                  backgroundColor: 'black',
                  color: 'white',
                  width: '90%',
                  border: 'none',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'block'
                }}>
                  {layoutOption?.buttonCaption}
                </button>
              </div>
            </div> : null}


          <div className={`grid xl:grid-cols-${layoutOption?.itemDisplayNumber ?? 4} lg:grid-cols-${layoutOption?.itemDisplayNumber ?? 4} sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5`} style={{ padding: '0px', margin: '0px' }}>
            <DataIteration datas={products} startLength={0} endLength={layoutOption?.itemDisplayNumber ?? 4}>
              {({ datas }) => (
                <div data-aos="fade-up" key={datas.id} className="item" style={{ padding: '0px', margin: '0px' }} >
                  <ProductCardStyleOne type={type} datas={datas} layoutOption={layoutOption} slug={slug} />
                </div>
              )}
            </DataIteration>
          </div>


          {(layoutOption?.is3LineHeaderText ?? false) && (layoutOption?.isLeftOrRight == 1) ?
            <div style={{
              minWidth: '28%', maxWidth: '28%', flexDirection: 'column', display: (layoutOption?.is3LineHeaderText ?? false) ? 'flex' : 'none', alignItems: 'flex-end'
            }}>
              <div style={{ fontSize: '22px' }}>{layoutOption?.line1Text}</div>
              <div style={{ fontSize: '120px', fontWeight: '500' }}>{layoutOption?.line2Text}</div>
              <div style={{ fontSize: '20px' }}>{layoutOption?.line3Text}</div><br />

              <button style={{
                backgroundColor: 'black',
                color: 'white',
                width: '90%',
                border: 'none',
                padding: '8px 12px',
                cursor: 'pointer',
                textAlign: 'center',
              }}>
                "{layoutOption?.buttonCaption}"
              </button>

            </div> : null}
        </div >
      </ViewMoreTitle >
    </div >
  );
}
