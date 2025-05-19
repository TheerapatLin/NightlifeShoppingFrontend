import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PLACEHOLDER_IMG = "https://via.placeholder.com/300x300?text=No+Image";
const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL; // <<==== ใช้ตัวเดียวกับ Home

function formatPriceLevel(level) {
  if (!level || isNaN(level)) return "-";
  return "฿".repeat(Number(level));
}
function field(val) {
  return val && String(val).trim() ? val : "-";
}

const InfoVenues = () => {
  const { venue_id } = useParams();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venue_id) return;
    setLoading(true);
    axios.get(`${BASE_URL}/venue/${venue_id}`)
      .then(res => setVenue(res.data))
      .catch(() => setVenue(null))
      .finally(() => setLoading(false));
  }, [venue_id]);

  if (loading) {
    return (
      <div style={{ color: "#fff", background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading venue info...
      </div>
    );
  }
  if (!venue) {
    return (
      <div style={{ color: "#fff", background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Venue not found.
      </div>
    );
  }

  // Data fallback
  const coverImage = venue.image?.[0] || PLACEHOLDER_IMG;
  const name = field(venue.name);
  const priceLevel = venue.priceLevel ? formatPriceLevel(venue.priceLevel) : "-";
  const type = field(venue.type);
  const reviewStar = venue.reviewStar ?? "-";
  const reviewCount = venue.reviewCount ?? "-";
  const area = field(venue.location?.name);
  const address = field(venue.location?.description);
  const mapEmbed = (venue.location?.coordinates && venue.location.coordinates.length === 2)
    ? `https://maps.google.com/maps?q=${venue.location.coordinates[1]},${venue.location.coordinates[0]}&output=embed`
    : "";
  const dressCode = field(venue.dressCode);
  const vibes = venue.amenities?.join(", ") || "-";
  const bts = field(venue.nearestBTS || "-");
  const description = venue.descriptionEN || venue.descriptionTH || "-";
  const gallery = Array.isArray(venue.gallery) && venue.gallery.length ? venue.gallery : (venue.image ? venue.image.map(url => ({ url })) : []);
  const artists = Array.isArray(venue.artistRosters) && venue.artistRosters.length ? venue.artistRosters : [];
  const menuImage = venue.menuImage || "";
  const tags = venue.tags || [];

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "inherit" ,marginTop:"70px"}}>
      {/* Cover */}
      <div style={{ width: "100%", height: 260, background: `url(${coverImage}) center/cover` }}></div>

      {/* Main Info Grid */}
      <div
        className="container-main"
        style={{
          maxWidth: 1280,
          margin: "auto",
          marginTop: -70,
          padding: "0 5vw",
          display: "flex",
          flexDirection: "row",
          gap: 32,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left */}
        <div style={{ flex: 2, minWidth: 0 }}>
          <div style={{ color: "#ccc", fontSize: 14, marginBottom: 8 }}>
            {area} &nbsp;&gt;&nbsp; <b>{name}</b>
          </div>
          <h1 style={{ fontSize: 32, margin: 0, fontWeight: 700 }}>
            {name}
          </h1>
          <div style={{ color: "#AAA", fontSize: 18, margin: "8px 0 12px" }}>
            {priceLevel}
            {reviewStar !== "-" && (
              <span style={{ marginLeft: 10, color: "#ffc107", fontWeight: 600 }}>
                <i className="bi bi-star-fill"></i> {reviewStar} ({reviewCount})
              </span>
            )}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              rowGap: 8,
              columnGap: 16,
              fontSize: 15,
            }}
          >
            <div>Venue Type:</div>
            <div>{type}</div>
            <div>Area:</div>
            <div>{area}</div>
            <div>Address:</div>
            <div>{address}</div>
            <div>Dress Code:</div>
            <div>{dressCode}</div>
            <div>Amenities:</div>
            <div>{vibes}</div>
            <div>Tags:</div>
            <div>{tags.length ? tags.join(", ") : "-"}</div>
          </div>
          <div style={{ margin: "30px 0 0" }}>
            <h3>About {name}</h3>
            <div style={{ color: "#ccc", maxWidth: 600 }}>{description}</div>
          </div>
        </div>
        {/* Right */}
        <div
          style={{
            flex: 1,
            minWidth: 250,
            maxWidth: 340,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <button
            style={{
              background: "#2269FF",
              color: "#fff",
              fontWeight: 700,
              border: 0,
              borderRadius: 8,
              padding: "12px 0",
              fontSize: 16,
              marginBottom: 10,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Book Now
          </button>
          {/* Google Map */}
          <div
            style={{
              background: "#191c22",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 4px 16px #0008",
              width: "100%",
              height: 210,
            }}
          >
            {mapEmbed ? (
              <iframe
                src={mapEmbed}
                width="100%"
                height="210"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="venue-map"
              ></iframe>
            ) : (
              <div style={{ color: "#888", padding: 28, textAlign: "center" }}>No Map</div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive BREAKPOINT */}
      <style>
        {`
        @media (max-width: 900px) {
          .container-gallery, .container-similar {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 650px) {
          .container-main {
            flex-direction: column !important;
            gap: 0 !important;
          }
          .container-gallery, .container-similar {
            grid-template-columns: 1fr !important;
          }
        }
        `}
      </style>

      {/* ----------- Gallery Section ----------- */}
      <div className="container-gallery" style={{
        maxWidth: 1280,
        margin: "44px auto 0",
        padding: "0 5vw",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 18,
      }}>
        {gallery.length > 0 ? (
          gallery.map((img, i) => (
            <img
              key={i}
              src={img.url || img || PLACEHOLDER_IMG}
              alt=""
              style={{
                width: "100%",
                borderRadius: 18,
                aspectRatio: "1/1",
                objectFit: "cover",
                background: "#181818",
              }}
            />
          ))
        ) : (
          <div style={{ gridColumn: "1/-1", color: "#aaa", textAlign: "center" }}>No images</div>
        )}
      </div>

      {/* ----------- DJ/Artist Rosters ----------- */}
      {artists.length > 0 && (
        <div style={{
          maxWidth: 1280,
          margin: "44px auto 0",
          padding: "0 5vw"
        }}>
          <h2 style={{ fontSize: 24, margin: "32px 0 14px" }}>DJ/Artist Rosters</h2>
          <div style={{
            display: "flex",
            gap: 16,
            overflowX: "auto",
            paddingBottom: 8,
          }}>
            {artists.map((artist, i) => (
              <img
                key={i}
                src={artist.imageUrl || PLACEHOLDER_IMG}
                alt={artist.name || "-"}
                style={{
                  width: 140,
                  borderRadius: 16,
                  objectFit: "cover",
                  aspectRatio: "1/1",
                  background: "#222",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ----------- Menu ----------- */}
      <div style={{
        maxWidth: 1280,
        margin: "44px auto 0",
        padding: "0 5vw"
      }}>
        <h2 style={{ fontSize: 24, margin: "32px 0 14px" }}>Menu</h2>
        {menuImage ? (
          <img
            src={menuImage}
            alt="Menu"
            style={{
              width: 140,
              borderRadius: 12,
              objectFit: "contain",
              background: "#fff",
              aspectRatio: "1/1"
            }}
          />
        ) : (
          <div style={{
            width: 140, height: 140, borderRadius: 12, background: "#181818", color: "#888", display: "flex", alignItems: "center", justifyContent: "center"
          }}>No menu image</div>
        )}
      </div>
      <div style={{ height: 80 }} />
    </div>
  );
};

export default InfoVenues;
