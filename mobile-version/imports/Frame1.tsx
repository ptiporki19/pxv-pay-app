import svgPaths from "./svg-qvt6gt9911";
import imgAvatars3DAvatar13 from "figma:asset/436985b609d053075017d7f78ccd2d5f7d059fcf.png";
import imgRectangle3 from "figma:asset/c9da98147ddcb539582a499b20c5af8da1104aa2.png";

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

function Group3() {
  return (
    <div className="absolute contents left-[18px] top-[692px]">
      <div className="absolute bg-neutral-100 h-[37px] left-[18px] rounded-lg top-[692px] w-[367px]" />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents left-[18px] top-[205px]">
      <div className="absolute bg-neutral-100 h-[37px] left-[18px] rounded-lg top-[205px] w-[367px]" />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[18px] top-[205px]">
      <Group4 />
      <div
        className="absolute font-['Roboto:Regular',_sans-serif] font-normal leading-[0] left-7 text-[#757575] text-[12px] text-left text-nowrap top-[215px] tracking-[0.4px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">{`Enter payment method name `}</p>
      </div>
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
        <p className="block leading-[1.4]">Manual payment method</p>
      </div>
      <ChevronDown />
    </div>
  );
}

function AccordionItem() {
  return (
    <div
      className="absolute bg-neutral-100 box-border content-stretch flex flex-row h-[37px] items-center justify-start left-[18px] p-[16px] rounded-lg top-[476px] w-[367px]"
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
          + Add field
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
      className="absolute bg-neutral-100 box-border content-stretch flex flex-row h-9 items-center justify-center left-[293px] p-0 top-[522px]"
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

function Content1() {
  return (
    <div
      className="bg-[#7f22fd] box-border content-stretch flex flex-row items-center justify-center overflow-clip p-0 relative rounded-lg shrink-0"
      data-name="Content"
    >
      <StateLayer1 />
    </div>
  );
}

function Button1() {
  return (
    <div
      className="absolute bg-neutral-100 box-border content-stretch flex flex-row h-9 items-center justify-center left-[319px] p-0 top-[738px]"
      data-name="Button"
    >
      <Content1 />
    </div>
  );
}

function StateLayer2() {
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

function Content2() {
  return (
    <div
      className="absolute bg-[#ffffff] left-[241px] rounded-lg top-[740px]"
      data-name="Content"
    >
      <div className="box-border content-stretch flex flex-row items-center justify-center overflow-clip p-0 relative">
        <StateLayer2 />
      </div>
      <div className="absolute border border-[#757575] border-solid inset-0 pointer-events-none rounded-lg" />
    </div>
  );
}

function StateLayer3() {
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
          + Add field
        </p>
      </div>
    </div>
  );
}

function Content3() {
  return (
    <div
      className="bg-[#7f22fd] box-border content-stretch flex flex-row items-center justify-center overflow-clip p-0 relative rounded-lg shrink-0"
      data-name="Content"
    >
      <StateLayer3 />
    </div>
  );
}

function Button2() {
  return (
    <div
      className="absolute bg-neutral-100 box-border content-stretch flex flex-row h-9 items-center justify-center left-[155px] p-0 top-[602px]"
      data-name="Button"
    >
      <Content3 />
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

function Bell() {
  return (
    <div className="absolute left-[283px] size-5 top-[83px]" data-name="Bell">
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

function Component3DAvatars13() {
  return (
    <div
      className="absolute left-[317px] size-[38px] top-[69px]"
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

function CploredLogo1() {
  return (
    <div
      className="absolute left-7 size-[68px] top-[62px]"
      data-name="cplored logo 1"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 68 68"
      >
        <g id="cplored logo 1">
          <path
            d={svgPaths.p2fd1600}
            fill="var(--fill-0, #6F56E5)"
            id="Vector"
          />
          <path
            d={svgPaths.pdd3dd80}
            fill="var(--fill-0, #A16FFC)"
            id="Vector_2"
          />
          <path
            d={svgPaths.p30069600}
            fill="var(--fill-0, #9D6EEC)"
            id="Vector_3"
          />
          <path
            d={svgPaths.p2381b300}
            fill="var(--fill-0, #936BDE)"
            id="Vector_4"
          />
          <path
            d={svgPaths.p21701200}
            fill="var(--fill-0, #7C61E6)"
            id="Vector_5"
          />
          <path
            d={svgPaths.p3eb495c0}
            fill="var(--fill-0, #9873D7)"
            id="Vector_6"
          />
          <path
            d={svgPaths.pdef6e00}
            fill="var(--fill-0, #956AE5)"
            id="Vector_7"
          />
          <path
            d={svgPaths.p1e832e00}
            fill="var(--fill-0, #BA79FE)"
            id="Vector_8"
          />
          <path
            d={svgPaths.p3ddaaf80}
            fill="var(--fill-0, #8462DA)"
            id="Vector_9"
          />
          <path
            d={svgPaths.p16e70f70}
            fill="var(--fill-0, #594BB2)"
            id="Vector_10"
          />
          <path
            d={svgPaths.p253d6e00}
            fill="var(--fill-0, #5C4DBB)"
            id="Vector_11"
          />
          <path
            d={svgPaths.p20febec0}
            fill="var(--fill-0, #5A4CB1)"
            id="Vector_12"
          />
          <path
            d={svgPaths.p345be780}
            fill="var(--fill-0, #8C65E6)"
            id="Vector_13"
          />
          <path
            d={svgPaths.p2feccb00}
            fill="var(--fill-0, #8E67E0)"
            id="Vector_14"
          />
          <path
            d={svgPaths.p298a0500}
            fill="var(--fill-0, #5A4EAB)"
            id="Vector_15"
          />
          <path
            d={svgPaths.p3fc9d400}
            fill="var(--fill-0, #7D60E0)"
            id="Vector_16"
          />
          <path
            d={svgPaths.pe24fa80}
            fill="var(--fill-0, #5E4EB3)"
            id="Vector_17"
          />
          <path
            d={svgPaths.p1dea1c80}
            fill="var(--fill-0, #755DF4)"
            id="Vector_18"
          />
          <path
            d={svgPaths.p34580900}
            fill="var(--fill-0, #AE78EE)"
            id="Vector_19"
          />
          <path
            d={svgPaths.p266f3ff0}
            fill="var(--fill-0, #956EDA)"
            id="Vector_20"
          />
          <path
            d={svgPaths.p2d42ea00}
            fill="var(--fill-0, #9370D2)"
            id="Vector_21"
          />
          <path
            d={svgPaths.p1f098100}
            fill="var(--fill-0, #5E4EC3)"
            id="Vector_22"
          />
          <path
            d={svgPaths.p365ddd00}
            fill="var(--fill-0, #6250B6)"
            id="Vector_23"
          />
          <path
            d={svgPaths.p6415c00}
            fill="var(--fill-0, #9B6BF0)"
            id="Vector_24"
          />
          <path
            d={svgPaths.p2cdb4800}
            fill="var(--fill-0, #7E61CD)"
            id="Vector_25"
          />
          <path
            d={svgPaths.pe041000}
            fill="var(--fill-0, #8165E2)"
            id="Vector_26"
          />
          <path
            d={svgPaths.p3253c880}
            fill="var(--fill-0, #7D5EE2)"
            id="Vector_27"
          />
          <path
            d={svgPaths.p13646000}
            fill="var(--fill-0, #7158CE)"
            id="Vector_28"
          />
          <path
            d={svgPaths.p168eb300}
            fill="var(--fill-0, #5D4DAA)"
            id="Vector_29"
          />
          <path
            d={svgPaths.p23582680}
            fill="var(--fill-0, #8363E5)"
            id="Vector_30"
          />
          <path
            d={svgPaths.p20448d00}
            fill="var(--fill-0, #B87AFC)"
            id="Vector_31"
          />
          <path
            d={svgPaths.p2fd5da00}
            fill="var(--fill-0, #5A4CB1)"
            id="Vector_32"
          />
          <path
            d={svgPaths.pcbd5700}
            fill="var(--fill-0, #5D4EB7)"
            id="Vector_33"
          />
          <path
            d={svgPaths.p185826f0}
            fill="var(--fill-0, #745BCE)"
            id="Vector_34"
          />
          <path
            d={svgPaths.p2f869a00}
            fill="var(--fill-0, #5A4DA8)"
            id="Vector_35"
          />
          <path
            d={svgPaths.p231a8b00}
            fill="var(--fill-0, #5C4DA6)"
            id="Vector_36"
          />
          <path
            d={svgPaths.p354eaf00}
            fill="var(--fill-0, #6350BB)"
            id="Vector_37"
          />
          <path
            d={svgPaths.p3a702700}
            fill="var(--fill-0, #6150B8)"
            id="Vector_38"
          />
          <path
            d={svgPaths.pb4d6100}
            fill="var(--fill-0, #7058D0)"
            id="Vector_39"
          />
          <path
            d={svgPaths.p1a513d00}
            fill="var(--fill-0, #9A6DEF)"
            id="Vector_40"
          />
          <path
            d={svgPaths.pb838800}
            fill="var(--fill-0, #6150B3)"
            id="Vector_41"
          />
          <path
            d={svgPaths.p1861c70}
            fill="var(--fill-0, #9B7FD7)"
            id="Vector_42"
          />
          <path
            d={svgPaths.pd2bd200}
            fill="var(--fill-0, #511BA7)"
            id="Vector_43"
          />
          <path
            d={svgPaths.p2d7526f0}
            fill="var(--fill-0, #7E65D3)"
            id="Vector_44"
          />
          <path
            d={svgPaths.p1aa11500}
            fill="var(--fill-0, #AB7DF3)"
            id="Vector_45"
          />
          <path
            d={svgPaths.p3b08cd00}
            fill="var(--fill-0, #AA80EA)"
            id="Vector_46"
          />
          <path
            d={svgPaths.p22f81780}
            fill="var(--fill-0, #AE84EB)"
            id="Vector_47"
          />
          <path
            d={svgPaths.pddc4b00}
            fill="var(--fill-0, #6659BA)"
            id="Vector_48"
          />
          <path
            d={svgPaths.p208db100}
            fill="var(--fill-0, #866ADB)"
            id="Vector_49"
          />
          <path
            d={svgPaths.p1cbdf580}
            fill="var(--fill-0, #876BD7)"
            id="Vector_50"
          />
          <path
            d={svgPaths.p28e7cf00}
            fill="var(--fill-0, #7360CF)"
            id="Vector_51"
          />
          <path
            d={svgPaths.p38e1b700}
            fill="var(--fill-0, #AD84E9)"
            id="Vector_52"
          />
          <path
            d={svgPaths.pc6d4100}
            fill="var(--fill-0, #AE83EC)"
            id="Vector_53"
          />
          <path
            d={svgPaths.p302d1380}
            fill="var(--fill-0, #6A5ABE)"
            id="Vector_54"
          />
          <path
            d={svgPaths.pf278a00}
            fill="var(--fill-0, #7D64D2)"
            id="Vector_55"
          />
          <path
            d={svgPaths.p915b00}
            fill="var(--fill-0, #856BD7)"
            id="Vector_56"
          />
          <path
            d={svgPaths.p133db70}
            fill="var(--fill-0, #9C78E2)"
            id="Vector_57"
          />
          <path
            d={svgPaths.p19763680}
            fill="var(--fill-0, #A97EF2)"
            id="Vector_58"
          />
          <path
            d={svgPaths.p355e5700}
            fill="var(--fill-0, #AA7DF2)"
            id="Vector_59"
          />
          <path
            d={svgPaths.p3d72f600}
            fill="var(--fill-0, #AD83E8)"
            id="Vector_60"
          />
          <path
            d={svgPaths.pad66bc0}
            fill="var(--fill-0, #AC83EB)"
            id="Vector_61"
          />
          <path
            d={svgPaths.p3f70a080}
            fill="var(--fill-0, #511BA7)"
            id="Vector_62"
          />
          <path
            d={svgPaths.p2e094380}
            fill="var(--fill-0, #A87FE8)"
            id="Vector_63"
          />
        </g>
      </svg>
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="bg-[#f4f4f4] relative size-full">
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
      <Group3 />
      <div
        className="absolute font-['Roboto:Regular',_sans-serif] font-normal leading-[0] left-7 text-[#757575] text-[12px] text-left text-nowrap top-[284px] tracking-[0.4px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">
          Brief description of the payment method
        </p>
      </div>
      <div
        className="absolute font-['Roboto:Regular',_sans-serif] font-normal leading-[0] left-[25px] text-[#757575] text-[12px] text-left text-nowrap top-[703px] tracking-[0.4px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">
          Enter specific instructions for this country...
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
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-5 not-italic text-[#1e1e1e] text-[13px] text-left text-nowrap top-[669px] tracking-[0.15px]">
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          Instruction
        </p>
      </div>
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-[31px] not-italic text-[#1e1e1e] text-[13px] text-left text-nowrap top-[452px] tracking-[0.15px]">
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          Payment Type
        </p>
      </div>
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-[34px] not-italic text-[#1e1e1e] text-[13px] text-left text-nowrap top-[528px] tracking-[0.15px]">
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          Payment Details
        </p>
      </div>
      <Group2 />
      <AccordionItem />
      <div className="absolute h-[95px] left-[18px] top-[566px] w-[367px]">
        <img
          className="block max-w-none size-full"
          height="95"
          src={imgRectangle3}
          width="367"
        />
      </div>
      <Frame2 />
      <Button />
      <Button1 />
      <Content2 />
      <Button2 />
      <div
        className="absolute font-['Roboto:Regular',_sans-serif] font-normal leading-[0] left-[201px] text-[#757575] text-[12px] text-center text-nowrap top-[578px] tracking-[0.4px] translate-x-[-50%]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">
          No payment information configured
        </p>
      </div>
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-[31px] not-italic text-[#1e1e1e] text-[13px] text-left text-nowrap top-[390px] tracking-[0.15px]">
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          Country
        </p>
      </div>
      <AccordionItem1 />
      <Bell />
      <Component3DAvatars13 />
      <CploredLogo1 />
    </div>
  );
}