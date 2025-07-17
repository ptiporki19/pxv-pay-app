import svgPaths from "./svg-7a6l5e9azu";
import imgAvatars3DAvatar13 from "figma:asset/436985b609d053075017d7f78ccd2d5f7d059fcf.png";

function Bell() {
  return (
    <div className="absolute left-[279px] size-5 top-[68px]" data-name="Bell">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Bell">
          <g id="Icon">
            <path d={svgPaths.p1e17c7c0} fill="var(--fill-0, #0D0D0D)" />
            <path d={svgPaths.p4aa2980} fill="var(--fill-0, #0D0D0D)" />
            <path
              d={svgPaths.p27e72a00}
              stroke="var(--stroke-0, #2B2B2B)"
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
      className="absolute left-[323px] size-[53px] top-[52px]"
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

function Content1() {
  return (
    <div
      className="basis-0 grow h-full min-h-px min-w-px mr-[-16px] relative shrink-0"
      data-name="Content"
    >
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start px-5 py-0 relative size-full">
          <div
            className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#757575] text-[12px] text-left text-nowrap tracking-[0.4px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">{`search `}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-6" data-name="Icon">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 24 24"
      >
        <g id="Icon">
          <path d={svgPaths.pc423380} fill="var(--fill-0, #757575)" id="icon" />
        </g>
      </svg>
    </div>
  );
}

function StateLayer1() {
  return (
    <div
      className="box-border content-stretch flex flex-row h-10 items-center justify-center p-0 relative shrink-0 w-full"
      data-name="State-layer"
    >
      <Icon1 />
    </div>
  );
}

function Content2() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-center overflow-clip p-0 relative rounded-[100px] shrink-0 w-10"
      data-name="Content"
    >
      <StateLayer1 />
    </div>
  );
}

function Component1stTrailingIcon() {
  return (
    <div
      className="box-border content-stretch flex flex-row items-center justify-center p-0 relative shrink-0 size-12"
      data-name="1st trailing-icon"
    >
      <Content2 />
    </div>
  );
}

function TrailingElements() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-row items-center justify-end p-0 right-1 translate-y-[-50%]"
      data-name="Trailing-Elements"
      style={{ top: "calc(50% + 0.5px)" }}
    >
      <Component1stTrailingIcon />
    </div>
  );
}

function StateLayer2() {
  return (
    <div
      className="basis-0 bg-[#ffffff] grow h-full min-h-px min-w-px relative shrink-0"
      data-name="state-layer"
    >
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row items-center justify-start pl-1 pr-5 py-1 relative size-full">
          <Content1 />
          <TrailingElements />
        </div>
      </div>
    </div>
  );
}

function SearchBar() {
  return (
    <div
      className="absolute bg-[#e0d6e6] box-border content-stretch flex flex-row gap-1 h-[37px] items-center justify-start left-[17px] max-w-[720px] overflow-clip p-0 rounded-lg top-[179px] w-[275px]"
      data-name="Search bar"
    >
      <StateLayer2 />
    </div>
  );
}

function Content4() {
  return (
    <div
      className="basis-0 grow h-full min-h-px min-w-px mr-[-16px] relative shrink-0"
      data-name="Content"
    >
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start px-5 py-0 size-full" />
      </div>
    </div>
  );
}

function StateLayer4() {
  return (
    <div
      className="basis-0 bg-[#ffffff] grow h-full min-h-px min-w-px relative shrink-0"
      data-name="state-layer"
    >
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row items-center justify-start pl-1 pr-5 py-1 relative size-full">
          <Content4 />
        </div>
      </div>
    </div>
  );
}

function SearchBar1() {
  return (
    <div
      className="absolute bg-[#e0d6e6] box-border content-stretch flex flex-row gap-1 h-[37px] items-center justify-start left-[299px] max-w-[720px] overflow-clip p-0 rounded-lg top-[179px] w-[87px]"
      data-name="Search bar"
    >
      <StateLayer4 />
    </div>
  );
}

function StateLayer5() {
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

function Content5() {
  return (
    <div
      className="bg-[#9b55fd] box-border content-stretch flex flex-row items-center justify-center overflow-clip p-0 relative rounded-lg shrink-0"
      data-name="Content"
    >
      <StateLayer5 />
    </div>
  );
}

function Button() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-row h-9 items-center justify-center left-[316px] p-0 top-[138px]"
      data-name="Button"
    >
      <Content5 />
    </div>
  );
}

export default function Frame5() {
  return (
    <div className="bg-[#ffffff] relative size-full">
      <div className="absolute bg-[#ffffff] h-[806px] left-0 rounded-lg top-0 w-[403px]" />
      <Bell />
      <Component3DAvatars13 />
      <div className="absolute font-['Futura_Round:Regular',_sans-serif] h-10 leading-[0] left-[25px] not-italic text-[#0d0d0d] text-[24px] text-left top-[129px] w-[173px]">
        <p className="block leading-[44px]">Payment Methods</p>
      </div>
      <SearchBar />
      <SearchBar1 />
      <div className="absolute bg-[#ffffff] h-[577px] left-[17px] rounded-tl-[8px] rounded-tr-[8px] top-[229px] w-[369px]" />
      <div
        className="absolute font-['Roboto:Regular',_sans-serif] font-normal leading-[0] left-[41px] text-[#0d0d0d] text-[12px] text-left text-nowrap top-[280px] tracking-[0.4px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">
          Countries : US, CA, HT...
        </p>
      </div>
      <div
        className="absolute font-['Roboto:Regular',_sans-serif] font-normal leading-[0] left-9 text-[#0d0d0d] text-[12px] text-left text-nowrap top-[372px] tracking-[0.4px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">
          Countries : US, CA, HT...
        </p>
      </div>
      <div
        className="absolute font-['Roboto:Regular',_sans-serif] font-normal leading-[0] left-[37px] text-[#0d0d0d] text-[12px] text-left text-nowrap top-[465px] tracking-[0.4px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">
          Countries : US, CA, HT...
        </p>
      </div>
      <div
        className="absolute font-['Roboto:Regular',_sans-serif] font-normal leading-[0] left-[38px] text-[#0d0d0d] text-[12px] text-left text-nowrap top-[547px] tracking-[0.4px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">
          Countries : US, CA, HT...
        </p>
      </div>
      <div
        className="absolute font-['Roboto:Regular',_sans-serif] font-normal leading-[0] left-[37px] text-[#0d0d0d] text-[12px] text-left text-nowrap top-[630px] tracking-[0.4px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">
          Countries : US, CA, HT...
        </p>
      </div>
      <div
        className="absolute font-['Roboto:Regular',_sans-serif] font-normal leading-[0] left-9 text-[#0d0d0d] text-[12px] text-left text-nowrap top-[721px] tracking-[0.4px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">
          Countries : US, CA, HT...
        </p>
      </div>
      <div
        className="absolute bg-[#04dc00] h-[19px] left-[318px] rounded-[15px] top-[242px] w-[50px]"
        data-name="Rounded rectangle"
      />
      <div
        className="absolute bg-[#fb3228] h-[19px] left-[313px] rounded-[15px] top-[334px] w-[50px]"
        data-name="Rounded rectangle"
      />
      <div
        className="absolute bg-[#04dc00] h-[19px] left-[314px] rounded-[15px] top-[427px] w-[50px]"
        data-name="Rounded rectangle"
      />
      <div
        className="absolute bg-[#04dc00] h-[19px] left-[315px] rounded-[15px] top-[509px] w-[50px]"
        data-name="Rounded rectangle"
      />
      <div
        className="absolute h-[19px] left-[314px] top-[592px] w-[50px]"
        data-name="Rounded rectangle"
      >
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 50 19"
        >
          <path
            d={svgPaths.p30865500}
            fill="var(--fill-0, #FFC526)"
            id="Rounded rectangle"
          />
        </svg>
      </div>
      <div
        className="absolute bg-[#04dc00] h-[19px] left-[313px] rounded-[15px] top-[683px] w-[50px]"
        data-name="Rounded rectangle"
      />
      <div
        className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold h-4 leading-[0] left-[326px] text-[#ffffff] text-[11px] text-left top-[243px] tracking-[0.5px] w-[38px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px]">Active</p>
      </div>
      <div
        className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold h-4 leading-[0] left-[317px] text-[#ffffff] text-[11px] text-left top-[335px] tracking-[0.5px] w-[47px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px]">inactive</p>
      </div>
      <div
        className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold h-4 leading-[0] left-[322px] text-[#ffffff] text-[11px] text-left top-[428px] tracking-[0.5px] w-[38px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px]">Active</p>
      </div>
      <div
        className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold h-4 leading-[0] left-[323px] text-[#ffffff] text-[11px] text-left top-[510px] tracking-[0.5px] w-[38px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px]">Active</p>
      </div>
      <div
        className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold h-4 leading-[0] left-[326px] text-[#ffffff] text-[11px] text-left top-[593px] tracking-[0.5px] w-[38px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px]">Draft</p>
      </div>
      <div
        className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold h-4 leading-[0] left-[321px] text-[#ffffff] text-[11px] text-left top-[684px] tracking-[0.5px] w-[38px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px]">Active</p>
      </div>
      <div
        className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold h-[11px] leading-[0] left-[335px] text-[#0d0d0d] text-[11px] text-left top-[269px] tracking-[0.5px] w-[33px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px]">...</p>
      </div>
      <div
        className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold h-[11px] leading-[0] left-[330px] text-[#0d0d0d] text-[11px] text-left top-[361px] tracking-[0.5px] w-[33px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px]">...</p>
      </div>
      <div
        className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold h-[11px] leading-[0] left-[331px] text-[#0d0d0d] text-[11px] text-left top-[454px] tracking-[0.5px] w-[33px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px]">...</p>
      </div>
      <div
        className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold h-[11px] leading-[0] left-[332px] text-[#0d0d0d] text-[11px] text-left top-[536px] tracking-[0.5px] w-[33px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px]">...</p>
      </div>
      <div
        className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold h-[11px] leading-[0] left-[331px] text-[#0d0d0d] text-[11px] text-left top-[619px] tracking-[0.5px] w-[33px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[16px]">...</p>
      </div>
      <Button />
      <div className="absolute bg-[#9b55fd] h-[59px] left-0 top-[745px] w-[403px]" />
    </div>
  );
}