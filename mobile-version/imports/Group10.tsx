import svgPaths from "./svg-umg97xgwhw";
import imgAvatars3DAvatar13 from "figma:asset/436985b609d053075017d7f78ccd2d5f7d059fcf.png";

function Bell() {
  return (
    <div className="absolute left-[289px] size-5 top-[54px]" data-name="Bell">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Bell">
          <g id="Icon">
            <path d={svgPaths.p1e17c7c0} fill="var(--fill-0, black)" />
            <path d={svgPaths.p4aa2980} fill="var(--fill-0, black)" />
            <path
              d={svgPaths.p27e72a00}
              stroke="var(--stroke-0, #1E1E1E)"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ChevronLeft() {
  return (
    <div
      className="absolute left-[22px] size-6 top-[131px]"
      data-name="Chevron left"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 24 24"
      >
        <g id="Chevron left">
          <path
            d="M15 18L9 12L15 6"
            id="Icon"
            stroke="var(--stroke-0, #1E1E1E)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[18px] top-[274px]">
      <div className="absolute bg-neutral-100 h-[37px] left-[18px] rounded-lg top-[274px] w-[367px]" />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents left-[23px] top-[563px]">
      <div className="absolute bg-neutral-100 h-[37px] left-[23px] rounded-lg top-[563px] w-[359px]" />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents left-[18px] top-[205px]">
      <div className="absolute bg-neutral-100 h-[37px] left-[18px] rounded-lg top-[205px] w-[367px]" />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[18px] top-[205px]">
      <Group3 />
      <div
        className="absolute font-['Roboto:Regular',_sans-serif] font-normal leading-[0] left-7 text-[#757575] text-[12px] text-left text-nowrap top-[215px] tracking-[0.4px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">{`Enter payment method name `}</p>
      </div>
    </div>
  );
}

function Component3DAvatars13() {
  return (
    <div
      className="absolute left-[323px] size-[38px] top-10"
      data-name="3D Avatars / 13"
    >
      <div
        className="absolute bg-center bg-cover bg-no-repeat inset-0"
        data-name="Avatars / 3d_avatar_13"
        style={{ backgroundImage: `url('${imgAvatars3DAvatar13}')` }}
      />
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="relative shrink-0 size-5" data-name="Chevron down">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Chevron down">
          <path
            d="M5 7.5L10 12.5L15 7.5"
            id="Icon"
            stroke="var(--stroke-0, #1E1E1E)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function AccordionTitle() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-row gap-2 grow items-center justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="Accordion Title"
    >
      <div className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1e1e1e] text-[13px] text-left">
        <p className="block leading-[1.4]">Payment Link</p>
      </div>
      <ChevronDown />
    </div>
  );
}

function AccordionItem() {
  return (
    <div
      className="absolute bg-neutral-100 box-border content-stretch flex flex-row h-[37px] items-center justify-start left-5 p-[16px] rounded-lg top-[479px] w-[367px]"
      data-name="Accordion Item"
    >
      <AccordionTitle />
    </div>
  );
}

function Frame2() {
  return <div className="absolute left-[314px] size-[100px] top-[494px]" />;
}

function StateLayer() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-1 items-center justify-center px-3 py-1.5 relative shrink-0"
      data-name="State-layer"
    >
      <div
        className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#ffffff] text-[14px] text-left text-nowrap tracking-[0.1px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[20px] whitespace-pre">
          Create
        </p>
      </div>
    </div>
  );
}

function Content() {
  return (
    <div
      className="bg-[#7f22fd] box-border content-stretch flex flex-row items-center justify-center overflow-clip p-0 relative rounded-lg shrink-0"
      data-name="Content"
    >
      <StateLayer />
    </div>
  );
}

function Button() {
  return (
    <div
      className="absolute bg-neutral-100 box-border content-stretch flex flex-row h-9 items-center justify-center left-[311px] p-0 top-[615px]"
      data-name="Button"
    >
      <Content />
    </div>
  );
}

function StateLayer1() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-1 items-center justify-center px-3 py-1.5 relative shrink-0"
      data-name="State-layer"
    >
      <div
        className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#000000] text-[14px] text-left text-nowrap tracking-[0.1px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[20px] whitespace-pre">
          Cancel
        </p>
      </div>
    </div>
  );
}

function Content1() {
  return (
    <div
      className="absolute bg-[#ffffff] left-[233px] rounded-lg top-[617px]"
      data-name="Content"
    >
      <div className="box-border content-stretch flex flex-row items-center justify-center overflow-clip p-0 relative">
        <StateLayer1 />
      </div>
      <div className="absolute border border-[#757575] border-solid inset-0 pointer-events-none rounded-lg" />
    </div>
  );
}

function ChevronDown1() {
  return (
    <div className="relative shrink-0 size-5" data-name="Chevron down">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Chevron down">
          <path
            d="M5 7.5L10 12.5L15 7.5"
            id="Icon"
            stroke="var(--stroke-0, #1E1E1E)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function AccordionTitle1() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-row gap-2 grow items-center justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="Accordion Title"
    >
      <div
        className="basis-0 font-['Roboto:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[#757575] text-[12px] text-left tracking-[0.4px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">Select country</p>
      </div>
      <ChevronDown1 />
    </div>
  );
}

function AccordionItem1() {
  return (
    <div
      className="absolute bg-neutral-100 box-border content-stretch flex flex-row h-[37px] items-center justify-start left-[18px] p-[16px] rounded-lg top-[414px] w-[367px]"
      data-name="Accordion Item"
    >
      <AccordionTitle1 />
    </div>
  );
}

function Home() {
  return (
    <div
      className="absolute h-5 left-[25px] top-[766px] w-[23px]"
      data-name="Home"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 23 20"
      >
        <g id="Home">
          <path
            d={svgPaths.p2d467f00}
            id="Icon"
            stroke="var(--stroke-0, #F5F5F5)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function Link() {
  return (
    <div
      className="absolute left-[90px] size-[21px] top-[765px]"
      data-name="Link"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 21 21"
      >
        <g clipPath="url(#clip0_2_3266)" id="Link">
          <path
            d={svgPaths.p381c5300}
            id="Icon"
            stroke="var(--stroke-0, #F5F5F5)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_2_3266">
            <rect fill="white" height="21" width="21" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Package() {
  return (
    <div
      className="absolute left-40 size-[22px] top-[765px]"
      data-name="Package"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 22 22"
      >
        <g id="Package">
          <path
            d={svgPaths.p2b77e300}
            id="Icon"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function Pocket() {
  return (
    <div
      className="absolute left-[360px] size-[22px] top-[765px]"
      data-name="Pocket"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 22 22"
      >
        <g id="Pocket">
          <path
            d={svgPaths.pb9c0400}
            id="Icon"
            stroke="var(--stroke-0, #F5F5F5)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function CreditCard() {
  return (
    <div
      className="absolute left-[229px] size-[21px] top-[765px]"
      data-name="Credit card"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 21 21"
      >
        <g clipPath="url(#clip0_2_3260)" id="Credit card">
          <path
            d={svgPaths.p49076f0}
            id="Icon"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_2_3260">
            <rect fill="white" height="21" width="21" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Image() {
  return (
    <div
      className="absolute left-[300px] size-[21px] top-[766px]"
      data-name="Image"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 21 21"
      >
        <g id="Image">
          <path
            d={svgPaths.p163af300}
            fill="var(--stroke-0, #F5F5F5)"
            id="Icon"
          />
        </g>
      </svg>
    </div>
  );
}

export default function Group10() {
  return (
    <div className="relative size-full">
      <div className="absolute bg-[#ffffff] h-[806px] left-0 rounded-lg top-0 w-[403px]" />
      <div
        className="absolute font-['Roboto:Regular',_sans-serif] font-normal leading-[0] left-7 text-[#b3b3b3] text-[12px] text-left top-[343px] tracking-[0.4px] w-[357px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px]">
          Configure payment method for each country where the payment method
          will be available
        </p>
      </div>
      <div
        className="absolute font-['Roboto:Regular',_sans-serif] font-normal leading-[0] left-[25px] text-[#b3b3b3] text-[12px] text-left top-[544px] tracking-[0.4px] w-[357px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px]">{` User will be directed to this link to complete payment`}</p>
      </div>
      <Bell />
      <ChevronLeft />
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-7 not-italic text-[#1e1e1e] text-[13px] text-left text-nowrap top-[181px] tracking-[0.15px]">
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          Payment Method Name
        </p>
      </div>
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-7 not-italic text-[#1e1e1e] text-[13px] text-left text-nowrap top-[319px] tracking-[0.15px]">
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          Country Configuration
        </p>
      </div>
      <div className="absolute font-['Futura_Round:Regular',_sans-serif] h-10 leading-[0] left-[152px] not-italic text-[#000000] text-[24px] text-left top-[123px] w-60">
        <p className="block leading-[44px]">Create Payment Method</p>
      </div>
      <Group1 />
      <Group4 />
      <div
        className="absolute font-['Roboto:Regular',_sans-serif] font-normal leading-[0] left-7 text-[#757575] text-[12px] text-left text-nowrap top-[284px] tracking-[0.4px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">
          Brief description of the payment method
        </p>
      </div>
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-7 not-italic text-[#1e1e1e] text-[13px] text-left text-nowrap top-[250px] tracking-[0.15px]">
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          Description
        </p>
      </div>
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-7 not-italic text-[#1e1e1e] text-[13px] text-left text-nowrap top-[250px] tracking-[0.15px]">
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          Description
        </p>
      </div>
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-7 not-italic text-[#1e1e1e] text-[13px] text-left text-nowrap top-[519px] tracking-[0.15px]">
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          Payment URL
        </p>
      </div>
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-[31px] not-italic text-[#1e1e1e] text-[13px] text-left text-nowrap top-[452px] tracking-[0.15px]">
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          Payment Type
        </p>
      </div>
      <Group2 />
      <Component3DAvatars13 />
      <AccordionItem />
      <Frame2 />
      <Button />
      <Content1 />
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-[31px] not-italic text-[#1e1e1e] text-[13px] text-left text-nowrap top-[390px] tracking-[0.15px]">
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          Country
        </p>
      </div>
      <AccordionItem1 />
      <div className="absolute bg-[#7f22fd] h-[49px] left-0 top-[757px] w-[403px]" />
      <Home />
      <Link />
      <Package />
      <Pocket />
      <CreditCard />
      <Image />
      <div
        className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold leading-[0] left-[88px] text-[10px] text-left text-neutral-100 text-nowrap top-[782px] tracking-[0.15px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          Links
        </p>
      </div>
      <div
        className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold leading-[0] left-[153px] text-[10px] text-left text-neutral-100 text-nowrap top-[782px] tracking-[0.15px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          Product
        </p>
      </div>
      <div
        className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold leading-[0] left-[214px] text-[10px] text-left text-neutral-100 text-nowrap top-[782px] tracking-[0.15px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          P. Methods
        </p>
      </div>
      <div
        className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold leading-[0] left-[296px] text-[10px] text-left text-neutral-100 text-nowrap top-[782px] tracking-[0.15px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          Brands
        </p>
      </div>
      <div
        className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold leading-[0] left-[341px] text-[10px] text-left text-neutral-100 text-nowrap top-[782px] tracking-[0.15px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          Verifications
        </p>
      </div>
    </div>
  );
}