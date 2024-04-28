import { Button } from "@nextui-org/react";
import { LayoutGroup, motion } from "framer-motion";
import Modal from "react-modal";
import { DayPicker } from "react-day-picker";
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useContext,
  ReactNode,
} from "react";
import { toast } from "sonner";
import "react-day-picker/dist/style.css";
import { FaXmark } from "react-icons/fa6";

interface ShowroomProps {
  showroom: any;
}

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

interface ToolProps {
  tool_call: any;
}

const ScheduleMeetingTool = ({ tool_call }: ToolProps) => {
  // const { selectedMeeting, meetings, chatEnded, sendAction } =
  //   useContext(FUContext);
  // const disabled =
  //   selectedMeeting != meetings[meetings.length - 1].timestamp || chatEnded;

  // let parsed = undefined;
  // try {
  //   parsed = JSON.parse(tool_call.function.arguments);
  //   const { year, month, day, hour, minute } = parsed;
  //   parsed = new Date(year, month - 1, day, hour, minute);
  // } catch (e) {
  //   parsed = undefined;
  // }

  const [selected, setSelected] = useState<Date | undefined>(undefined);

  const current = selected;
  return (
    <div>
      {
        <DayPicker
          // key={selectedMeeting}
          className="bg-white "
          style={{ margin: "0px" }}
          mode="single"
          selected={current}
          onSelect={setSelected}
          // disabled={disabled}
          footer={
            <div className="flex flex-col justify-center">
              {/* <p className="text-primary/100 font-bold text-center my-3">
                Your meeting will be on {current!.toLocaleDateString()}.
              </p> */}
              <Button
                className="bg-black rounded-sm text-white mt-4"
                // isDisabled={disabled}
                onClick={() => {
                  // sendAction({
                  //   type: "SCHEDULE_MEETING",
                  //   timestamp: current.getTime() / 1000,
                  // });
                  toast.info("Scheduling meeting...");
                }}
              >
                Schedule Test Drive
              </Button>
            </div>
          }
        />
      }
    </div>
  );
};

const Showroom = ({ showroom }: ShowroomProps) => {
  //   const carList: any[] = [1, 2, 3, 4, 5, 6, 6, 3, 3, 3, 3, 3];
  // list of dicts with car details
  // const carList = [
  //   {
  //     model: "A-Class",
  //     body_type: "Compact",
  //     num_seats: 5,
  //     powertrain: "ICE",
  //     specs: {},
  //     price: "€110,000",
  //     image_link: [
  //       "https://assets.oneweb.mercedes-benz.com/iris/iris.png?COSY-EU-100-1713d0VXqaWFqtyO67PobzIr3eWsrrCsdRRzwQZg9BZbMw3SGtGyWtsd2sDcUfp8fXGEuiRJ0l3IJOB2NMcbApRTyI5uGoxQC30SpkzNHTwm7j87mhKVis3%25vq4y9yLRgYFYaxPJWrH1yBRn8wYTyoiZB7lM4FAOrTg9LQ96PDacpSeWHnStsd8oxcUfiXyXGE45wJ0lg%25fOB2znobQOcxwRs%25M4FzKyTg9itk6PD4%25NSeWgyhtsdRHQcUfGU6XGE0aSJ0lBIVOB2AMnbAp5dXI5gZ8lXhRjwQZgV4Tu8uoQ3pE77V9hDNt3DkSW9wUwopoL24PvEa2zq7Dwc=&BKGND=9&IMGT=P27&POV=BE040%2CPZM&im=Trim&fuzz=0.5&width=670",
  //     ],
  //   },
  //   {
  //     model: "EQS",
  //     body_type: "Limousine",
  //     num_seats: 5,
  //     powertrain: "EV",
  //     price: "€130,000",
  //     image_link: [
  //       "https://assets.oneweb.mercedes-benz.com/iris/iris.png?COSY-EU-100-1713d0VXq0WFqtyO67PobzIr3eWsrrCsdRRzwQZgk4ZbMw3SGtGyWtsd2vtcUfp8cXGEuiRJ0l3IrOB2NzObApRAlI5ux4uQC31gFkzNwtnm7jZaShKV5SM%25vqCv%25yLRzAHYax75prH1KMrn8wvT2oiZUbXM4FG4fTg90v36PDBSbSeWAtRtsd5c%25cUfCykXGEzhEJ0lL6tOB2aS1bApHYXI5usouQC3UC1kzNG%25wm7j0yFhKVBbQ%25vqAIjyLR5YmYaxCrJrH1zgtn8w7XxoiZekXM4FsQkTSMrp32aJm7jG63hKVUXd%25vq7UTyLRKGXYaxvbErH1LbWn8wussoiZ45pM4FgCPTg9Pt26PDecmSevjzFoJpENtjUcKU6zWmtdDZGGlqJRfrdRcYxqN8NmDmA9KLBZ59U2GRNn=&BKGND=9&IMGT=P27&POV=BE040%2CPZM&im=Trim&fuzz=0.5&width=670",
  //     ],
  //   },
  //   {
  //     model: "GLB",
  //     body_type: "SUV",
  //     num_seats: 5,
  //     powertrain: "ICE",
  //     price: "€68,000",
  //     image_link: [
  //       "https://assets.oneweb.mercedes-benz.com/iris/iris.png?COSY-EU-100-1713d0VXqNEFqtyO67PobzIr3eWsrrCsdRRzwQZYZ4ZbMw3SGtlaWtsd2HVcUfpO6XGEubXJ0l3otOB2NMEbApjtwI5ux5xQC31SrkzNBTwm7jA7mhKV5Yh%25vqCJjyLRz3yYaxPXWrH1eJtn8ws8noiZUidM4FGR1Tg906O6PDBSsSeWAhutsd6vDcUfSO6XGEvajJ0lL4qOB2aScbApHtxI5u8ruQC3UM3kzNG%25wm7j0cmhKVBbh%25vqAIlyLR5YXYaxC4WrH1zgun8w7XxoiZx6YM4F1mlTg9Ukm6tTnuNpHOhKVU9QC6VgDkzIqgWm7s08dhK%25hqf%25vycDEyLYXrlYarJv2rHn30pn8o9ZuoiMvl3Mk5bHlqGeAN56zQH4b4FNgiaSSszq7Pfg7jdKzAyAFiFX8QmcaJ86US7AE=&BKGND=9&IMGT=P27&POV=BE040%2CPZM&im=Trim&fuzz=0.5&width=670",
  //     ],
  //   },
  // ];
  const carList = showroom.showing;
  console.log(carList);

  const modalIsOpen = showroom.isTestdriveBooking;

  function closeModal() {
    showroom.sendAction({ type: "END_CHAT" });
  }

  return (
    <div className="h-full">
      {/* <button onClick={openModal}>Open Schedule Meeting Tool</button> */}
      <LayoutGroup>
        <div className="pl-10 text-3xl font-serif p-6 bg-black text-white text-center flex align-middle">
          <img src="mercedes_logo.svg" alt="" className="h-10" />
          <h1 className="ml-5 text-xl text-slate-200 self-center">
            Mercedes Showroom
          </h1>
        </div>
        {carList.length > 0 ? (
          <motion.div
            // style={{
            //   backgroundImage: "url(background_merc.png)",
            //   backgroundSize: "100% auto",
            //   backgroundRepeat: "no-repeat",
            // }}
            className="flex flex-wrap  items-start gap-5 p-10 pt-8 w-full h-full overflow-scroll scrollbar-hide"
          >
            {/* <div className="bg-white w-full rounded-md shadow-[0_0px_2px_0.5px_rgba(0,0,0,0.32)] p-5">
          Here are some amazing options I compiled for you!
        </div> */}
            <p className="font-serif text-3xl">Here are our Family SUVs</p>
            <div className="bg-white w-full flex items-center">
              {/* <div className="rounded-md shadow-[0_0px_2px_0.5px_rgba(0,0,0,0.32)] p-2 px-3 mr-4 font-light ">
            Status: Available
          </div> */}

              <div className="font-light pb-2">Showing the best 3 options</div>
            </div>
            {carList.map((car: any, i: number) => (
              <motion.div
                key={i}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                // className={`flex flex-row bg-default-50 rounded-2xl focus:ring-4 ring-primary/100 w-96 justify-center`}
                className={`bg-white rounded-md shadow-[0_0px_2px_0.5px_rgba(0,0,0,0.32)] w-72 p-10 transition-transform duration-500 hover:cursor-pointer`} //hover:shadow-[0_2px_15px_1px_rgba(0,0,0,0.24)]
              >
                <p className="font-bold text-sm mt-1 italic -mt-3 mb-4">
                  "{car.reason}"
                </p>

                <img
                  className="transition-transform duration-300 hover:scale-110 h-24 m-auto"
                  src={car.image_url[0]}
                  alt=""
                />
                <p className="font-bold mt-4 text-lg">{car.specs.model}</p>
                <p className="font-light text-sm">
                  {car.vehicle_type} • {car.num_seats} Seats •{" "}
                  {car.powertrain_type}
                </p>
                <p className="font-bold text-sm mt-1">
                  €{numberWithCommas(car.price_in_usd)}
                </p>

                {
                  //car.specs is an object with key value pairs
                  Object.keys(car.specs).map((key: string, i: number) => (
                    <p key={i} className="font-light text-sm">
                      {key}: {car.specs[key]}
                    </p>
                  ))
                }

                {/* <button className="bg-[#0078d6] text-white mt-4 p-2 w-full">
              I like this
            </button> */}
              </motion.div>
            ))}
            <div className="p-44"></div>
          </motion.div>
        ) : (
          <div className="flex w-full h-full pb-36 items-center justify-center">
            <p className="font-serif text-center text-4xl">
              Welcome to the Showroom! 💫
            </p>
          </div>
        )}
      </LayoutGroup>
      {modalIsOpen && (
        <div className="flex justify-around bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-xl rounded-md  p-10  border-black border-2">
          {/* w-[700px] */}
          {/* <div className="">
            <img
              className="transition-transform duration-300 hover:scale-110 h-24 m-auto"
              src={carList[0].image_url[0]}
              alt=""
            />
            <p className="font-bold mt-4 text-lg">{carList[0].specs.model}</p>
            <p className="font-light text-sm">
              {carList[0].vehicle_type} • {carList[0].num_seats} Seats •{" "}
              {carList[0].powertrain_type}
            </p>
            <p className="font-bold text-sm mt-1">
              €{numberWithCommas(carList[0].price_in_usd)}
            </p>
          </div> */}
          <div className="flex flex-col items-end">
            <button className="mb-8" onClick={closeModal}>
              <FaXmark></FaXmark>
            </button>
            <ScheduleMeetingTool tool_call={undefined} />
          </div>
        </div>
      )}
    </div>
  );
};

export { Showroom };
