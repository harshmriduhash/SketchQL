import Heading from "./components/Heading"
import SubHeading from "./components/SubHeading"
import PriceCard from "./components/PriceCard"
export default function Pricing(){
    return(
        <div className="">
            <div className="text-center pt-5">
              <Heading className={"fs-1 fw-bold"} word={"Pricing plans for Students"}/>
              <SubHeading className={"fs-3"} word={"Start for free. Upgrade anytime."}/>
            </div>

            <div>
                <PriceCard className={""} title={"Explorer"} features={["Public Diagrams Only","3 AI prompts per day","Public Diagrams Only","ORM Exports(SQL Alchemy"]} price={"0"} />
            </div>
        </div>
    )
}