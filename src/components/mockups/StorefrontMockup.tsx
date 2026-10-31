import { ExpressRoute } from "./ExpressRoute";
import { MockupFrame } from "./MockupFrame";
import { PhoneStorefront } from "./PhoneStorefront";

export function StorefrontMockup() {
  return (
    <MockupFrame
      title="hamza-cloth / shop"
      label="Mockup of the Hamza Cloth phone storefront with a bottom navigation bar, beside a Hamza Express delivery route and a payment note credited after UTR approval."
    >
      <div className="grid h-full grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-4 p-4">
        <div className="h-full min-h-0">
          <PhoneStorefront />
        </div>
        <ExpressRoute />
      </div>
    </MockupFrame>
  );
}
