import { LayoutGroup, motion } from "framer-motion";

const Showroom = () => {
  //   const carList: any[] = [1, 2, 3, 4, 5, 6, 6, 3, 3, 3, 3, 3];
  // list of dicts with car details
  const carList = [
    {
      model: "A-Class",
      body_type: "Compact",
      num_seats: 5,
      powertrain: "ICE",
      specs: {},
      price: "€110,000",
      image_link:
        "https://assets.oneweb.mercedes-benz.com/iris/iris.png?COSY-EU-100-1713d0VXqaWFqtyO67PobzIr3eWsrrCsdRRzwQZg9BZbMw3SGtGyWtsd2sDcUfp8fXGEuiRJ0l3IJOB2NMcbApRTyI5uGoxQC30SpkzNHTwm7j87mhKVis3%25vq4y9yLRgYFYaxPJWrH1yBRn8wYTyoiZB7lM4FAOrTg9LQ96PDacpSeWHnStsd8oxcUfiXyXGE45wJ0lg%25fOB2znobQOcxwRs%25M4FzKyTg9itk6PD4%25NSeWgyhtsdRHQcUfGU6XGE0aSJ0lBIVOB2AMnbAp5dXI5gZ8lXhRjwQZgV4Tu8uoQ3pE77V9hDNt3DkSW9wUwopoL24PvEa2zq7Dwc=&BKGND=9&IMGT=P27&POV=BE040%2CPZM&im=Trim&fuzz=0.5&width=670",
      product_link:
        "https://www.mercedes-benz.de/passengercars/buy/new-car/product.html/EQS-450-4MATIC_0-20121215_DE_354ae2f5",
    },
    {
      model: "EQS",
      body_type: "Limousine",
      num_seats: 5,
      powertrain: "EV",
      price: "€130,000",
      image_link:
        "https://assets.oneweb.mercedes-benz.com/iris/iris.png?COSY-EU-100-1713d0VXq0WFqtyO67PobzIr3eWsrrCsdRRzwQZgk4ZbMw3SGtGyWtsd2vtcUfp8cXGEuiRJ0l3IrOB2NzObApRAlI5ux4uQC31gFkzNwtnm7jZaShKV5SM%25vqCv%25yLRzAHYax75prH1KMrn8wvT2oiZUbXM4FG4fTg90v36PDBSbSeWAtRtsd5c%25cUfCykXGEzhEJ0lL6tOB2aS1bApHYXI5usouQC3UC1kzNG%25wm7j0yFhKVBbQ%25vqAIjyLR5YmYaxCrJrH1zgtn8w7XxoiZekXM4FsQkTSMrp32aJm7jG63hKVUXd%25vq7UTyLRKGXYaxvbErH1LbWn8wussoiZ45pM4FgCPTg9Pt26PDecmSevjzFoJpENtjUcKU6zWmtdDZGGlqJRfrdRcYxqN8NmDmA9KLBZ59U2GRNn=&BKGND=9&IMGT=P27&POV=BE040%2CPZM&im=Trim&fuzz=0.5&width=670",
      product_link:
        "https://www.mercedes-benz.de/passengercars/buy/new-car/product.html/EQS-450-4MATIC_0-20121215_DE_354ae2f5",
    },
  ];

  //attach more to carList for testing
  for (let i = 0; i < 3; i++) {
    carList.push(carList[0]);
    carList.push(carList[1]);
  }
  return (
    <LayoutGroup>
      <div className="text-3xl font-serif p-6 bg-black text-white text-center flex align-middle">
        <img src="mercedes_logo.svg" alt="" className="h-10" />
        <h1 className="ml-5 text-xl text-slate-200 self-center">
          Mercedes Showroom
        </h1>
      </div>
      {/* <p>Here are some amazing options I compiled for you.</p> */}
      <motion.div
        style={{
          backgroundImage: "url(background_merc.png)",
          backgroundSize: "100% auto",
          backgroundRepeat: "no-repeat",
        }}
        className="flex flex-wrap  items-start gap-10 p-10 w-full h-full overflow-scroll scrollbar-hide"
      >
        <div className="bg-white w-full rounded-md shadow-[0_0px_2px_0.5px_rgba(0,0,0,0.32)] p-5">
          Here are some amazing options I compiled for you.
        </div>
        {carList.map((car) => (
          <motion.div
            layout
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            // className={`flex flex-row bg-default-50 rounded-2xl focus:ring-4 ring-primary/100 w-96 justify-center`}
            className={`bg-white rounded-md shadow-[0_0px_2px_0.5px_rgba(0,0,0,0.32)] w-72 h-64 p-10 transition-transform duration-500 hover:cursor-pointer`} //hover:shadow-[0_2px_15px_1px_rgba(0,0,0,0.24)]
          >
            <img
              className="transition-transform duration-300 hover:scale-110"
              src={car.image_link}
              alt=""
            />
            <p className="font-bold mt-4 text-lg">{car.model}</p>
            <p className="font-light text-sm">
              {car.body_type} • {car.num_seats} Seats • {car.powertrain}
            </p>
            <p className="font-bold text-sm mt-1">UVP {car.price}</p>
          </motion.div>
        ))}
        <div className="p-44"></div>
      </motion.div>
    </LayoutGroup>
  );
};

export { Showroom };
