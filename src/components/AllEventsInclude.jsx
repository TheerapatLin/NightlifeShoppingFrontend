import { width } from "@mui/system";
import React, { useState } from "react";

const AllEventsInclude = () => {
  const [activeSection, setActiveSection] = useState("WEEKDAYS");

  const sections = {
    WEEKDAYS: {
      title: "Mingle Tingle",
      maxPeople: 10,
      features: [
        {
          icon: "🌟",
          title: "BEST 4 SELECTED VENUES",
          description: "Only by special reservation! 2 bars and 2 nightclubs",
        },
        {
          icon: "🍸",
          title: "EXCLUSIVE DRINKS",
          description:
            "Buy a drink and get free complimentary drink at first two bars",
        },
        {
          icon: "🎉",
          title: "SPECIAL ENTRY",
          description:
            "Free entry (Lady get 3 free drinks on Thursday at the first nightclub) or Paid entry with one free drink",
        },
        {
          icon: "🚐",
          title: "PARTY VAN",
          description: "We have our private nice party van to take us around",
        },
        {
          icon: "👥",
          title: "GREAT NEW FRIENDSHIP",
          description:
            "Our host is an experience friendly host. Meet nice local people who would love to join our group",
        },
      ],
    },
    WEEKENDS: {
      title: "Bar Crawl",
      maxPeople: 20,
      features: [
        {
          icon: "🌟",
          title: "BEST 4 SELECTED VENUES",
          description: "2 bars and 2 nightclubs",
        },
        {
          icon: "🍸",
          title: "EXCLUSIVE DRINKS",
          description:
            "One free drink at the first bar. Unlimited free drinks on Saturday night at the first nightclub",
        },
        {
          icon: "🎉",
          title: "SPECIAL ENTRY",
          description:
            "Special Free entry for the first nightclub. Paid entry with one free drink for second nightclub",
        },
        {
          icon: "🚐",
          title: "PARTY VAN",
          description: "We have our private nice party van to take us around",
        },
        {
          icon: "👥",
          title: "GREAT NEW FRIENDSHIP",
          description:
            "Our host is an experience friendly host. Meet nice local people who would love to join our group",
        },
      ],
    },
  };

  const activeData = sections[activeSection];

  return (
    <div className="bg-gray-900 text-white p-8">
      {/* <h2 className="text-3xl font-normal text-center mb-8">Our nights to remember in Bangkok!</h2> */}
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="/img/our_night.gif"
          style={{
            maxWidth: "min(100%,400px)",
            padding: "0px",
            marginBottom: "20px",
          }}
        ></img>
      </div>
      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveSection("WEEKDAYS")}
          className={`px-4 py-2 rounded-full text-lg font-semibold transition-all duration-200 ${
            activeSection === "WEEKDAYS"
              ? "bg-yellow-400 text-black hover:bg-yellow-500"
              : "border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
          }`}
        >
          Mingle Tingle
        </button>
        <button
          onClick={() => setActiveSection("WEEKENDS")}
          className={`px-4 py-2 rounded-full text-lg font-semibold transition-all duration-200 ${
            activeSection === "WEEKENDS"
              ? "bg-yellow-400 text-black hover:bg-yellow-500"
              : "border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
          }`}
        >
          Bar Crawl
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Content Section */}
        <div className="bg-gray-800 rounded-lg p-6 max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-yellow-400">
              {activeData.title}
            </h3>
            <p className="text-lg mt-2">Max {activeData.maxPeople} people</p>
          </div>

          <div className="space-y-6">
            {activeData.features.map((feature, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <div className="text-2xl flex-shrink-0 mt-1">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-yellow-400">
                    {feature.title}
                  </h4>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 w-full flex justify-center md:mt-0">
          <iframe
            className="rounded-lg shadow-lg"
            width="560"
            height="415"
            src="https://www.youtube.com/embed/playlist?list=PLLju3MoxlN8wFcSxZiFjtTaY317mOYwF6&mute=1&autoplay=1&loop=1"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default AllEventsInclude;
