import { CurveType, FeeStructure } from "../../../../src/model/orca/pool/pool-types";
import {
  QuoteBuilder,
  QuoteBuilderFactory,
  QuotePoolParams,
} from "../../../../src/model/quote/quote-builder";
import { PercentageUtils } from "../../../../src/model/utils/percentage";

import { OrcaToken, OrcaU64, Quote } from "../../../../src";
import { u64 } from "@solana/spl-token";
import Decimal from "decimal.js";
import { Builder } from "builder-pattern";
import { defaultQuotePoolParams } from "../../../test-utils";
import { solToken, usdcToken } from "../../../../src/constants/pools";
import { DecimalUtil } from "../../../../src/utils/numbers/decimal-utils";

const builder: QuoteBuilder = QuoteBuilderFactory.getBuilder(CurveType.ConstantProduct);

test("Input & Output tokens have different scale", () => {
  const params = Builder<QuotePoolParams>(defaultQuotePoolParams).build();

  const quote = builder.buildQuote(
    params,
    DecimalUtil.toU64(new Decimal(10), params.inputToken.scale)
  );

  expect(quote.getRate()).toEqual(new Decimal(24.175536));
  expect(quote.getPriceImpact()).toEqual(new Decimal(0.036059));
  expect(quote.getFees()).toEqual(new OrcaU64(new u64("30000000"), params.inputToken.scale));
  expect(quote.getMinOutputAmount()).toEqual(
    new OrcaU64(new u64("241513608"), params.outputToken.scale)
  );
  expect(quote.getExpectedOutputAmount()).toEqual(
    new OrcaU64(new u64("241755364"), params.outputToken.scale)
  );
});

test("Input & Output tokens have the same scale", () => {
  const usdcTokenWithSameScale = Builder<OrcaToken>(usdcToken).scale(solToken.scale).build();
  const params = Builder<QuotePoolParams>(defaultQuotePoolParams)
    .outputTokenCount(new u64("670432580208000"))
    .outputToken(usdcTokenWithSameScale)
    .build();

  const quote = builder.buildQuote(
    params,
    DecimalUtil.toU64(new Decimal(10), params.inputToken.scale)
  );

  expect(quote.getRate()).toEqual(new Decimal(24.175536404));
  expect(quote.getPriceImpact()).toEqual(new Decimal(0.036059609));
  expect(quote.getFees()).toEqual(new OrcaU64(new u64("30000000"), params.inputToken.scale));
  expect(quote.getMinOutputAmount()).toEqual(
    new OrcaU64(new u64("241513608677"), params.outputToken.scale)
  );
  expect(quote.getExpectedOutputAmount()).toEqual(
    new OrcaU64(new u64("241755364042"), params.outputToken.scale)
  );
});

test("Input trade amount equal 0 ", () => {
  const params = Builder<QuotePoolParams>(defaultQuotePoolParams).build();

  const quote = builder.buildQuote(
    params,
    DecimalUtil.toU64(new Decimal(0), params.inputToken.scale)
  );

  expect(quote.getRate()).toEqual(new Decimal(0));
  expect(quote.getPriceImpact()).toEqual(new Decimal(0));
  expect(quote.getFees()).toEqual(new OrcaU64(new u64("0"), params.inputToken.scale));
  expect(quote.getMinOutputAmount()).toEqual(new OrcaU64(new u64("0"), params.outputToken.scale));
  expect(quote.getExpectedOutputAmount()).toEqual(
    new OrcaU64(new u64("0"), params.outputToken.scale)
  );
});

test("Input Token Count is zero", () => {
  const params = Builder<QuotePoolParams>(defaultQuotePoolParams)
    .inputTokenCount(new u64("0"))
    .build();

  const quote = builder.buildQuote(
    params,
    DecimalUtil.toU64(new Decimal(10), params.inputToken.scale)
  );

  expect(quote.getRate()).toEqual(new Decimal(67043.258021));
  expect(quote.getPriceImpact()).toEqual(new Decimal(0));
  expect(quote.getFees()).toEqual(new OrcaU64(new u64("30000000"), params.inputToken.scale));
  expect(quote.getMinOutputAmount()).toEqual(
    new OrcaU64(new u64("669762147627"), params.outputToken.scale)
  );
  expect(quote.getExpectedOutputAmount()).toEqual(
    new OrcaU64(new u64("670432580208"), params.outputToken.scale)
  );
});

test("Output Token Count is zero", () => {
  const params = Builder<QuotePoolParams>(defaultQuotePoolParams)
    .outputTokenCount(new u64("0"))
    .build();

  const quote = builder.buildQuote(
    params,
    DecimalUtil.toU64(new Decimal(10), params.inputToken.scale)
  );

  expect(quote.getRate()).toEqual(new Decimal(0));
  expect(quote.getPriceImpact()).toEqual(new Decimal(0));
  expect(quote.getFees()).toEqual(new OrcaU64(new u64("30000000"), params.inputToken.scale));
  expect(quote.getMinOutputAmount()).toEqual(new OrcaU64(new u64("0"), params.outputToken.scale));
  expect(quote.getExpectedOutputAmount()).toEqual(
    new OrcaU64(new u64("0"), params.outputToken.scale)
  );
});

describe("Slippage tolerance", () => {
  test("tolerance equal 0", () => {
    const params = Builder<QuotePoolParams>(defaultQuotePoolParams)
      .slippageTolerance(PercentageUtils.fromDecimal(new Decimal(0)))
      .build();
    const quote = builder.buildQuote(
      params,
      DecimalUtil.toU64(new Decimal(10), params.inputToken.scale)
    );

    expect(quote.getRate()).toEqual(new Decimal(24.175536));
    expect(quote.getPriceImpact()).toEqual(new Decimal(0.036059));
    expect(quote.getFees()).toEqual(new OrcaU64(new u64("30000000"), params.inputToken.scale));
    expect(quote.getMinOutputAmount()).toEqual(
      new OrcaU64(new u64("241755364"), params.outputToken.scale)
    );
    expect(quote.getExpectedOutputAmount()).toEqual(
      new OrcaU64(new u64("241755364"), params.outputToken.scale)
    );
  });

  test("tolerance equals 0.1", () => {
    const params = Builder<QuotePoolParams>(defaultQuotePoolParams)
      .slippageTolerance(PercentageUtils.fromDecimal(new Decimal(0.1)))
      .build();
    const quote = builder.buildQuote(
      params,
      DecimalUtil.toU64(new Decimal(10), params.inputToken.scale)
    );

    expect(quote.getRate()).toEqual(new Decimal(24.175536));
    expect(quote.getPriceImpact()).toEqual(new Decimal(0.036059));
    expect(quote.getFees()).toEqual(new OrcaU64(new u64("30000000"), params.inputToken.scale));
    expect(quote.getMinOutputAmount()).toEqual(
      new OrcaU64(new u64("241513608"), params.outputToken.scale)
    );
    expect(quote.getExpectedOutputAmount()).toEqual(
      new OrcaU64(new u64("241755364"), params.outputToken.scale)
    );
  });

  test("tolerance equals 1 ", () => {
    const params = Builder<QuotePoolParams>(defaultQuotePoolParams)
      .slippageTolerance(PercentageUtils.fromDecimal(new Decimal(1)))
      .build();
    const quote = builder.buildQuote(
      params,
      DecimalUtil.toU64(new Decimal(10), params.inputToken.scale)
    );

    expect(quote.getRate()).toEqual(new Decimal(24.175536));
    expect(quote.getPriceImpact()).toEqual(new Decimal(0.036059));
    expect(quote.getFees()).toEqual(new OrcaU64(new u64("30000000"), params.inputToken.scale));
    expect(quote.getMinOutputAmount()).toEqual(
      new OrcaU64(new u64("239337810"), params.outputToken.scale)
    );
    expect(quote.getExpectedOutputAmount()).toEqual(
      new OrcaU64(new u64("241755364"), params.outputToken.scale)
    );
  });
});
