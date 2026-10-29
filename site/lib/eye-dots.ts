// logo.png halftone rasteri, 1/58 ızgara; kod 92 atlanır ki dizide kaçış karakteri oluşmasın.
const P =
	"n^2na2nc(nd/nf0ng)ja/k>/k@*kA+kC/ia.id0if*ig+ii/il/h9+h>)hA+hD,hG,hJ-hL)hM)hO,hR-hU,hX,hZ)h[)h^,ha,hd,ho,i%,g'(g/)g2)g5)g8*g=)g@)gC)gF)gK)gN)gQ)g])g`)el/en*eo)f#/f$/f&0f'/f(+f)+f*/f+/f-/f/*f0+f1/f2/f4/f5/f6+f7+f8/f90f;.f</f=)f>*f@0fB/dO.dR.dT*dU)dW/dZ.d^/da0dc*dd+df0di/dl/do/e$*e%+e'/e*/e-.e0/e2)e3+e5.e8.e;/e>1e@)eA+eC.cU0cV,cX1c[1c_2ca)cb2cd0ce-cg1cj0b//b5.b7.b8/b94b::b;3b<:b=4b>7b?8b@4bA:bB4bC:bD4bE6bF+bG/bH0bI(bJ0bK/bL*bM+bN/bO/bP3bQ9bR5bS6bT7bU4bV:bW3bX:bY4bZ*b[8b]/b^/b`0bb)bc,``.`c.`f.`i.`k*`l)`m/`n/a#.a$/a%/a&/a'2a(5a),a*5a+1a,0a-0a.2a/5a0+a1(a21a3(a5.a8/a:)a;+a=/a>+a?(a@2aA(aB(aC1aD5aE,aF4aG2aH)aI1aJ0aK/aM/aN/aO)aP+aQ/aT0aV)aW+aY.a]._S*_T+_V6_W/_X5_Y5_Z/_[5_^6__7_`4_a5_b._c+_d3_e+_f*_i+_l+_m)_n(_o(`$*`'*`**`-*`.*`1*`2*`4+`5*`64`7)`8/`96`;5`<0`>(`?+`@*`B+`C*^@1^A0^B7^C4^D6^E5^F6^G6^H/^I6^K+^L+^N(^P*^R+^S)^V*^Y+^Z+^[(^])^_7^a.^b0^d0^e+^h+^i+^k(^l*^m+^o+_#*_%*_&+_'*_)+_*+_+5_,)_-+_.+_0,_1+]&*]')]).],0]-/]..]/5]04]1+]27]31]4*]5*]6/]7/]:/]=/]@4]B.]C0]D1]E4]F+]G5]H5]I/]J0]K4]L7]M*]N6]O5]P0]Q2]R4]S7]T*]U4]V2]W)]X0]Y/]Z/][,]]0]^/]_.]`,]a0]b4]d0]e/]f)]g+]h0]i/]k0]m)]n+^#.^&.Zd/Zf9Zg5Zh7Zi6Zj=Zk:Zl2ZmBZn4Zo*[#*[$/[%/['/[(/[)*[*)[+/[,0[.;[/5[07[18[2:[3F[4>[5A[6D[7F[8E[9C[:O[;>[<I[=F[>G[?F[@C[AP[B>[CB[D:[E8[F7[G0[H0[I4[J0[K0[L6[M-[N4[O:[Q0[R0[S)[T,[U0[V/[X0[Y/[Z)[[,[]0YR0YS4YT,YU4YV4YW0YZ(Yb(Yc(Yd4Ye4Yf-Yg4Yh1Yi2Yj2Yk7Yl>Ym<YnJYoBZ#BZ$BZ%HZ&BZ'>Z(JZ)AZ*BZ+AZ,GZ-BZ.=Z/HZ0AZ1@Z22Z3HZ4;Z53Z6<Z72Z8;Z95Z:3Z;6Z<,Z=5Z>0Z?3Z@.ZC(X:.X<7X=*X>4X?9X@3XA:XB=XC8XD+XE.XH/XJ+XK*XM/XN2XO:XP>XQ7XR5XS>XTCXUKXVPXWRXXUXYLXZ>X[8X^0X_/X`*Xa8Xb/Xc0XeBXfPXgTXhLXiLXjYXkIXlQXmQXnTXoPY#LY$]Y%KY&NY'DY(UY)?Y*>Y+CY,5Y-;Y.6Y/*Y09Y10Y2/Y34Y41Y6*Y7,Y9.Y<.Y?.W)0W*1W+*W,2W-5W.,W/5W05W10W2*W3/W4/W6/W7.W:/W;/W<-W=6W>7W?;W@@WADWBRWCMWDFWERWFDWG2WH0WI/WJ(WK1WL/WM*WN0WO/WP/WQ(WR4WS5WT0WU?WVQWWOWX<WYVWZFW[FW]SW^CW_RW`OWaDWbIWcGWdAWeBWfDWg3Wh6Wi3Wj*Wk3Wl1Wm/Wn-Wo1X#/X$)X%+X&0U`)Uc)Ud*Ue(Uf6Ug0Uh7Ui3Uj.Uk*Un*Uo*V$*V&(V'6V(0V)7V*4V+CV,FV-SV.VV/QV0SV1QV2XV3BV45V5)V6+V7*V85V98V:1V;6V<7V=0V>8V?5V@+VA*VC9VDQVERVFPVGVVHNVIPVJWVKQVLSVMRVNYVOCVPGVQGVR@VSCVT:VUCVV;VW4VX9VY0VZ7V]+V^*V`)Vb)Ve)Vh)TM*TP*TQ+TR7TS6TT2TU7TX+TZ/T[6T]7T_+Ta<Tb;Tc0Td@TeITfUTg]ThVTiXTjUTkWTl[TmLTn3To8U#:U$2U%?U&7U'8U(1U)7U*8U+/U,8U-5U.AU/1U06U1*U29U3aU4PU5TU6]U7TU8VU9VU:WU;ZU<WU=QU>TU?KU@PUAVUB:UCFUDLUE7UF?UG6UH+UI5UJ-UK+UM)UO*UR*UU*S;/S</S>4S?2S@0SA/SB0SC0SE/SF/SG1SH1SI/SJ/SL4SM5SN2SO1SP7SQTSRNSSUSTaSUQSVXSW[SXUSYZSZ7S[0S]0S^1S_6S`8Sa,Sb8Sc3Sd2Se2Sf5Sg9Sh-Si5Sj2Sk/Sl0Sm4SncSoLT#RT$aT%QT&VT'ZT(VT)ZT*VT+RT,ST-AT.PT/ST0BT1DT2JT3:T4;T54T68T7-T85T92T:)T;+T</T=/T?/R&/R)/R*0R,;R-5R.8R/7R00R10R3/R40R5<R6<R7/R8/R::R;?R<;R=FR>UR?nR@eRAfRBgRCjRDeREfRFmRGJRH/RI0RJ7RK7RL>RMCRN<ROBRP6RQ=RR>RS>RTERU6RV:RW4RX7RY8RZ4R[HR]dR^eR_hR`iRadRbeRcnRddReeRfhRgRRhWRiTRjXRkRRlHRmHRnCRoGS#@S$CS%5S&:S'5S()S)+S*0S+.S.-S1-Pf1Pi;Pj,Pn4Po2Q#4Q&(Q'2Q(:Q)3Q*HQ+[Q,ZQ-eQ._Q/YQ0`Q1dQ2ZQ3XQ4_Q50Q63Q7.Q89Q97Q:1Q;9Q<3Q=;Q>.QA(QB(QC2QD:QE2QF7QG8QH,QI9QJMQKYQL`QMcQNYQOZQPdQQ]QR[QSaQTbQUQQVMQWdQXNQYRQZBQ[5Q]CQ^?Q_:Q`1Qa1Qc2OO+OP*OQ/OR0OS(OT:OU4OV7OW*OX0OY0OZ3O[:O]4O^,O_+O`4OaBOb3OcBOd=Oe`OfXOgXOhfOiZOjWOk^OlbOmWOnXOobP$:P%=P&5P'6P(>P)AP*(P+1P,0P-+P.,P/0P00P14P29P3;P48P5;P6<P79P8QP9WP:_P;`P<UP=WP>dP?XP@VPA_PBaPCSPDSPEePFSPGTPHRPISPJFPK=PLLPM3PNAPO5PP)PQ,PR/PS/PU/N9/N<.N?/N@0NA(NB5NC2ND1NE*NG0NH-NI5NJ2NK+NL*NM3NN8NO+NPGNQeNRfNS_NTnNUjNVaNWoNXeNYfNZnN[aN]NN_5N`7Na0Nb7Nc6Nd5Ne(Nf0Ng0Nh+Ni,Nj/Nk/Nl4Nm4Nn6NoFO#1O$6O%4O&MO'oO(eO)eO*mO+aO,kO-nO.^O/oO0oO1[O2nO3kO4`O5[O6PO7PO8@O9@O:DO;6O<8O=3O>)O?,O@/OA/OD.OG.M))M-)M.*M06M1/M4/M5>M65M76M8/M9(M:5M;;M<=M=GM>_M?eM@gMAbMBnMCkMDdMEoMFfMGhMHnMIcMJAMK2ML@MM0MN:MO;MP9MQ:MS*MT)MV(MW)MX*MY3MZ=M[8M]FM^:M_7M`5MaPMbnMcfMdgMenMfcMglMhoMiaMjmMkoMl`MmnMnlMoNN#YN$eN%ON&VN'@N(DN)9N*>N+;N,4N-(N.*N/)N1*Kd)Kf(Kh*Ki+Kk+Kl+Kn1Ko1L#8L$5L%+L&+L'0L(<L);L*AL+[L,WL-]L.cL/oL0WL1kL2oL3oL4oL5nL6WL7nL8OL:8L;:L<9L=?L>7L?1LA,LB+LC(LD)LE+LF+LG3LH>LI9LJ?LK<LL8LM8LNQLOWLPoLQnLRTLSoLToLUoLVoLWmLXoLYoLZWL[dL]WL^UL_QL`SLaILbHLcFLd:LeALf;Lg5Lh7Li+Lj*Ll,JO/JR.JU/JW+JX/JZ+J[/J]2J^7Ja/Jb0Jc/Jd7JeXJfoJgXJhoJimJjWJknJliJm[JnoJo`K#cK$oK%ZK&RK'*K(7K)5K*9K+1K,7K-?K.+K/0K0.K1*K2/K3/K43K5AK6CK79K8JK91K:5K;4K<NK=nK>aK?cK@oKAYKBkKCoKDoKEoKFoKGUKHoKIiKJXKKSKLPKMQKN?KOBKPBKQ5KR6KS7KT.KU,KV0KW/KZ.K^-Ka.I?.I@/IA+IB)ID0IE4IF/IG/IH+II6IJ5IKDIL(IM.IN/IO7IP7IQUIRnISiITkIUjIVkIWkIXoIYoIZjI[oI]lI^mI_oI`kIajIb1IcDId@Ie:IfBIg@IhOIi5Ij0Ik/Il*Im7In/Io9J#@J$JJ%FJ&JJ'<J(>J):J*QJ+oJ,lJ-lJ.hJ/kJ0oJ1oJ2oJ3oJ4oJ5iJ6oJ7oJ8jJ9cJ:hJ;RJ<UJ=CJ>RJ?<J@HJAEJB5JC,JD/JE/JG/JI)JJ+H73H8-H93H</H=9H>HH?YH@dHA^HBoHC`HDdHEoHFoHGoHHoHIoHJoHKoHLoHMoHNiHO>HP4HQ4HR9HS7HT3HU@HV>HW>HX4HY1HZ2H[4H];H^AH_CH`FHaJHb:Hc3Hd?He^HfoHgoHhnHiYHjoHkoHloHmoHnoHooI#oI$oI%oI&oI'YI(aI)OI*OI+>I,LI-3I.<I/.I03I14Ff-Fi.Fl.Fo.G#.G$6G%*G&/G'/G),G*:G+:G,QG-WG.hG/oG0UG1oG2mG3VG4oG5hG6YG7oG8^G9cG:oG;VG<kG=TG>@G?3G@DGACGB=GCPGD9GEGGF?GG@GHBGI>GJIGKJGLLGMAGNBGO>GP2GQTGRYGSoGT^GUaGVoGWWGXjGYoGZVG[nG]oG^UG_oG`hGaWGbVGc_GdTGeRGfIGgJGh;Gi@Gj5Gk5Gl+Gm/Gn.H$.H'-H*-EW+EX)EY/E]/E^/E_1E`*Ea/Eb/Ed5Ee6Ef1Eg^EhaEiOEj`Ek_EldEmcEnnEooF#oF$oF%_F&oF'nF(oF)oF*oF+nF,@F-2F.3F/CF0DF1MF2;F3EF4FF5FF6@F7DF8MF9?F:EF;HF<;F=4F>DF?lF@oFAoFBnFCoFDoFEoFFoFGoFHnFIoFJoFKlFL`FMhFN_FOZFPeFQPFROFS>FTOFU6FV9FW3FX/FY,FZ0F[/F^/F`)Fa+DA)DD)DG)DJ)DK)DN/DO5DP3DQ5DR/DS:DTTDUPDVhDWdDXaDYeDZgD[nD]oD^oD_oD`bDanDboDcoDdnDeoDfoDg^Dh1Di:DjADkCDlNDmBDnGDoDE#HE$DE%BE&NE'AE(HE)FE*4E+AE,YE-mE.nE/oE0nE1oE2oE3nE4oE5oE6oE7oE8oE9nE:bE;iE<bE=]E>ME?NE@AEA>EBMEC5ED6EE0EG(EH*EI)EL)EO)ER(C/*C2+C5*C8+C9+C:)C;(C<+C=+C?8C@7CAKCBOCCKCDXCEZCFVCGnCHnCIUCJnCKgCLYCMoCN[COcCPoCQTCRkCSoCTVCU[CV9CW8CX<CYYCZ>C[GC]MC^@C_LC`HCaFCbLCcJCd7CeYCfWCgoChhCiXCjoCk]ClaCmoCnUCojD#oD$VD%nD&nD'UD(nD)gD*PD+SD,ZD-QD.RD/HD0=D17D2-D3-D46D5*D6,D7*D:*D=*D@*B$0B&/B*/B+0B,+B-4B.0B/JB0OB1NB2QB3YB4XB5_B6aB7WB8XB9dB:YB;XB<nB=nB>WB?nB@hBAZBBoBC`BDQBE1BF3BG7BHDBIDBJ9BKKBLCBMDBN@BO1BP>BQPBRcBSnBTYBUjBVoBWWBXnBYnBZVB[oB]hB^XB_oB``BabBbVBcYBdcBeKBfPBgaBhPBiGBj2Bk4Bl.Bm5Bn3Bo*C#,C$0C%.C'/@W.@Z/@^.@a/@c*@d*@f/@g4@h:@i5@j?@kW@lU@mS@nM@o^A#gA$iA%dA&eA'lA(cA)jA*kA+lA,jA-iA.nA/iA0iA1lA2kA3bA4iA5SA6?A7MA8GA9JA:FA;GA<UA=gA>eA?lA@lAAhABkACnADhAEcAFkAGkAHjAIiAJnAKiALhAMhANhAObAPdAQVARNASVATQAUNAV;AW=AX;AY6AZ;A[6A])A^+A_/A`/Ac.Af.?U4?V,?W9?X@?Y<?ZM?[^?]T?^K?_c?`N?aK?bc?c^?do?e_?fc?go?hX?ij?jo?kX?lo?mn?nX?oo@#i@$^@%Z@&`@'d@(Y@)Y@*k@+o@,W@-o@.n@/W@0o@1h@2[@3X@4`@5b@6o@7X@8j@9o@:X@;_@<b@=P@>L@?c@@K@AO@BB@C3@D:@E2@F5@G3@I(@J3>7+>8*>@/>A0>B3>C9>D4>E<>FL>GH>HY>IU>JU>KP>L_>MS>NO>Oa>PY>QV>R[>Sc>TW>UU>Vc>WZ>XU>Y[>Za>[V>]V>^c>_Z>`V>a^>ba>cV>dW>ed>fY>gV>h]>ia>jU>kV>lb>mY>nV>o]?#`?$U?%V?&b?'U?(V?)Y?*[?+Q?,N?-`?.M?/R?0>?13?29?34?4:?54?6<?77?8*?9-?:0?;/?=/<n.=$/='/=*/=,+=-*=//=0.=15=23=34=4B=5C=6I=7;=8V=9O=:M=;^=<`==P=>a=?_=@d=Af=B_=Ca=Dg=E`=F_=Ge=He=I[=J`=Kg=L`=M_=Ne=Oe=P]=Qa=Rh=S`=T^=Ud=Ve=W[=Xa=Yg=Z_=[^=]d=^e=_^=``=ah=bL=cU=de=eN=fP=gO=hD=i*=j8=k7=l0=m4=n4=o6>#0>$8>%4>&)>',>(0>)/>,.>/-;l6;m.;n(;o9<#A<$M<%><&F<'P<(O<)A<*Q<+Q<,M<-Z<.d</N<0`<1a<2Q<3b<4]<5O<6g<7S<8P<9h<:M<;X<<e<=N<>_<?b<@O<Ab<B^<CN<Df<ER<FP<Gh<HN<IX<Je<KN<L^<Mb<NP<OM<PU<QO<RP<S<<T><U><V4<W7<X9<Y3<Z8<[*<]*<^6<_+<`*<a5<b(<c*<d):Y+:Z,:[7:]7:^3:_W:`K:aJ:bK:cS:dI:eE:fU:gQ:hQ:iQ:jU:kR:lM:mV:nQ:oR;#O;$V;%Q;&L;'X;(P;)Q;*R;+S;,R;-N;.U;/Q;0Q;1O;2U;3P;4L;5W;6O;7Q;8Q;9R;:Q;;N;<R;=F;>J;?L;@<;A>;B7;C8;D4;E8;F4;G7;H*;I1;J9;L-;M,;N(;O*;P,;Q+9B+9C*9E.9H/9I+9J+9K09L/9M)9N<9O49PK9QB9RA9SR9TL9UP9VO9WQ9XO9YO9ZS9[L9]Q9^O9_P9`N9aN9bS9cK9dN9eO9fQ9gM9hN9iS9jL9kO9lO9mP9nN9oM:#S:$L:%P:&P:'Q:(O:)O:*>:+0:,4:-1:..:/1:01:15:35:44:5*:61:71:80:9,::2:;0:<):=-:>0:?.:E-87+88*8:/8;48<:8=>8>>8?D8@D8AL8B>8C]8DF8EI8FW8GG8HV8IP8JI8KS8LR8ME8NW8OS8P>8QZ8RF8SG8TW8UD8VU8WP8XI8YT8ZS8[F8]V8^S8_>8`]8aE8bE8c;8d?8e;8f38gB8h58i68j98k48l;8m(8n;8o69#)9$:9%19&/9'59(19)/9*)9+,9,07*(7,47-57.,7/:70A71B72C73J74@75=76K77@78A79B7:G7;@7<=7=I7>@7?@7@C7AG7B@7C=7DJ7E?7F@7GC7HH7IA7J=7KJ7L?7M?7N-7O77P97Q,7R57T37U.7W57X)7Y(7Z07[(7](7a(7d(5V/5X+5Y*5[/5_05b05e/5g,5h+5i15j/5l95m45n75o=6#66$@6%:6&F6'66(T6)A6*;6+X6,:6-I6.N6/A60L61H62?63I64D65666>67768369:6;/6<06=*6>76?16@06A26B06C16D66E-6F56G;6H(6I:6J66K*6L86M16N06O(6P16Q06R*6S-6U.6X/4E/4H.4I/4K/4L/4M*4N*4P.4S/4T*4U)4V.4Y44[04]14^24_54`-4a94b24c24d34e74f84g+4h94i64j24k24l64m54n,4o55#25$05%15&15'55).5*/5+)5,05-/5./5/-50051/52053-54255556(57658359*5:25;05</5=(5>15?/3,)3/)32)37)39)3:)3=)3@)3E*3G)3H)3K)3N*3S)3V)3Y)3])3^)3a)3b)3e)3h)3i)3k*3l)3n(3o*4#)4%*4&)4((4)*4*)4,*4/(41)1g,1j+1m,1o(2#(2%+2'+2(+2))2*62+,2.+20)21(23+25,26,29+2<+2>(2?)2A+2D+2G+2I32J+2K,2L62M(2N+2O+2R+2U+2V,2X,2Y,2Z(2[*2]02^:2`82a12b(2c*2d,2e+2g+2j)2l+0b/0c/0d+0e*0f00g00i/0j/0k+0l*0m01#01%*1&+1(01+01.011013)14+16/18019/1</1?01@01A*1B+1C/1D01F11G01H*1I,1J01K01M01N01O*1P,1Q01R0/S//T//V//W//X*/Y)/Z//[//_//b//e//g*/h+/j//m/0#/0&/0()0)+0+.0./01/02/04005/06)07,08/09/0</0?00B00D)0E+.E(.F4.m(-0/-2/-3/-4+-5*-7/-:/-;*-<*-=0->/-L0-O/-R0-U0-V/-W)-X+-Z/-_*-`,-a/-b0-d0+a++b)+d/+o*,#),$/,'0,(/,)),*),+/,.0,//,2/,9/,:/,=/,@/,C/,G/,H/,J0,L),M+,O/,R/,U/,X0*T**W+*c**f**i)*l(*n*+$*+'*+**+-(+/*+2*+5)+8*+;(+=)+@*)B*)E+)P*)S*)V))[))_*)b*)e*)h()j*)m**#**&**))*+)*.+(H-(K.(M)(N*(P.(S.'$/'&*'')')/'S.#J*#K*#M/#P.#S.#V.";

const N = 58;
const COLS = 94;
const ROWS = 61;
const COL0 = -49;
const ROW0 = -29;
const BASE = 76;
const LEVELS = 75;
const CELLS = ROWS * COLS;
const TAU = Math.PI * 2;

// Anatomi rasterden ölçüldü; birim x/y ile aynı (1 = 58 hücre), SPREAD uygulanmadan önceki uzay.
const IRIS_X = -0.043103;
const IRIS_Y = 0.081897;
const IRIS_R = 0.172414;
const PUPIL_X = -0.03931;
const PUPIL_Y = 0.095172;
const PUPIL_R = 0.060345;
const UP0 = 0.26945;
const UP1 = 0.05202;
const UP2 = -0.66994;
const LO0 = -0.22269;
const LO1 = 0.0841;
const LO2 = 0.53692;

const count = P.length / 3;
const x = new Float32Array(count);
const y = new Float32Array(count);
const ink = new Float32Array(count);
const col = new Uint8Array(count);
const row = new Uint8Array(count);

for (let i = 0, k = 0; i < count; i++, k += 3) {
	let a = P.charCodeAt(k);
	let b = P.charCodeAt(k + 1);
	let c = P.charCodeAt(k + 2);
	if (a > 92) a--;
	if (b > 92) b--;
	if (c > 92) c--;

	const idx = (a - 35) * BASE + (b - 35);
	const cx = idx % COLS;
	const cy = (idx - cx) / COLS;

	col[i] = cx;
	row[i] = cy;
	x[i] = (cx + COL0 + 0.5) / N;
	y[i] = (cy + ROW0 + 0.5) / N;
	ink[i] = (c - 35) / LEVELS;
}

const rad = new Float32Array(count);
const ang = new Float32Array(count);
const edge = new Float32Array(count);
const open = new Float32Array(count);
const lid = new Float32Array(count);
const nrm = new Float32Array(count * 2);
const fiber = new Float32Array(count);
const phase = new Float32Array(count);
const zone = new Uint8Array(count);

function hash01(n: number) {
	let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
	h ^= h >>> 13;
	h = Math.imul(h, 0xc2b2ae35);
	h ^= h >>> 16;
	return (h >>> 0) / 4294967296;
}

function ringNoise(a: number, k: number, seed: number) {
	const t = (a / TAU + 1) * k;
	const i = Math.floor(t);
	const f = t - i;
	const s = f * f * (3 - 2 * f);
	const v0 = hash01((((i % k) + k) % k) * 3571 + seed);
	const v1 = hash01(((((i + 1) % k) + k) % k) * 3571 + seed);
	return v0 + (v1 - v0) * s;
}

function crypt(a: number, r: number, ka: number, kr: number, seed: number) {
	const ta = (a / TAU + 1) * ka;
	const tr = r * kr;
	const ia = Math.floor(ta);
	const ir = Math.floor(tr);
	const sa = (ta - ia) * (ta - ia) * (3 - 2 * (ta - ia));
	const sr = (tr - ir) * (tr - ir) * (3 - 2 * (tr - ir));
	const i0 = (((ia % ka) + ka) % ka) * 733;
	const i1 = ((((ia + 1) % ka) + ka) % ka) * 733;
	const j0 = ir * 15731;
	const j1 = (ir + 1) * 15731;
	const v00 = hash01((i0 + j0) ^ seed);
	const v10 = hash01((i1 + j0) ^ seed);
	const v01 = hash01((i0 + j1) ^ seed);
	const v11 = hash01((i1 + j1) ^ seed);
	const a0 = v00 + (v10 - v00) * sa;
	const a1 = v01 + (v11 - v01) * sa;
	return a0 + (a1 - a0) * sr;
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

const DX = UP1 - LO1;
const DA = UP2 - LO2;
const DC = UP0 - LO0;
const ROOT = Math.sqrt(DX * DX - 4 * DA * DC);
const CANTHUS_L = (-DX + ROOT) / (2 * DA);
const CANTHUS_R = (-DX - ROOT) / (2 * DA);

{
	const field = new Float32Array(CELLS);
	const swap = new Float32Array(CELLS);
	const has = new Uint8Array(CELLS);
	for (let i = 0; i < count; i++) {
		const o = row[i] * COLS + col[i];
		has[o] = 1;
		field[o] = ink[i];
	}

	for (let pass = 0; pass < 4; pass++) {
		swap.set(field);
		for (let r = 0; r < ROWS; r++) {
			const up = r > 0;
			const dn = r < ROWS - 1;
			for (let c = 0; c < COLS; c++) {
				const o = r * COLS + c;
				if (has[o]) continue;
				let s = 0;
				let n = 0;
				let v = up ? swap[o - COLS] : 0;
				if (v > 0) {
					s += v;
					n++;
				}
				v = dn ? swap[o + COLS] : 0;
				if (v > 0) {
					s += v;
					n++;
				}
				v = c > 0 ? swap[o - 1] : 0;
				if (v > 0) {
					s += v;
					n++;
				}
				v = c < COLS - 1 ? swap[o + 1] : 0;
				if (v > 0) {
					s += v;
					n++;
				}
				if (n) field[o] = s / n;
			}
		}
	}

	for (let pass = 0; pass < 2; pass++) {
		for (let r = 0; r < ROWS; r++) {
			for (let c = 0; c < COLS; c++) {
				const o = r * COLS + c;
				swap[o] = (field[c > 0 ? o - 1 : o] + 2 * field[o] + field[c < COLS - 1 ? o + 1 : o]) * 0.25;
			}
		}
		for (let r = 0; r < ROWS; r++) {
			for (let c = 0; c < COLS; c++) {
				const o = r * COLS + c;
				field[o] = (swap[r > 0 ? o - COLS : o] + 2 * swap[o] + swap[r < ROWS - 1 ? o + COLS : o]) * 0.25;
			}
		}
	}

	const gx = new Float32Array(CELLS);
	const gy = new Float32Array(CELLS);
	const mag = new Float32Array(CELLS);
	for (let r = 0; r < ROWS; r++) {
		const lo = (r > 0 ? r - 1 : 0) * COLS;
		const hi = (r < ROWS - 1 ? r + 1 : ROWS - 1) * COLS;
		const mid = r * COLS;
		for (let c = 0; c < COLS; c++) {
			const o = mid + c;
			const cl = c > 0 ? c - 1 : 0;
			const ch = c < COLS - 1 ? c + 1 : COLS - 1;
			const a = field[lo + cl];
			const b = field[lo + c];
			const d = field[lo + ch];
			const e = field[mid + cl];
			const f = field[mid + ch];
			const g = field[hi + cl];
			const h = field[hi + c];
			const k = field[hi + ch];
			const dx = (d + 2 * f + k - a - 2 * e - g) * 0.125;
			const dy = (g + 2 * h + k - a - 2 * b - d) * 0.125;
			gx[o] = dx;
			gy[o] = dy;
			mag[o] = Math.sqrt(dx * dx + dy * dy);
		}
	}

	let top = 1e-6;
	for (let o = 0; o < CELLS; o++) if (mag[o] > top) top = mag[o];
	const hist = new Int32Array(257);
	for (let o = 0; o < CELLS; o++) hist[((mag[o] / top) * 256) | 0]++;
	let acc = 0;
	let strong = top;
	let scale = top;
	for (let b = 0, hit = 0; b <= 256; b++) {
		acc += hist[b];
		if (hit === 0 && acc >= CELLS * 0.9) {
			strong = (b / 256) * top;
			hit = 1;
		}
		if (acc >= CELLS * 0.97) {
			scale = (b / 256) * top;
			break;
		}
	}

	const dist = new Float32Array(CELLS).fill(1e6);
	for (let o = 0; o < CELLS; o++) if (mag[o] >= strong) dist[o] = 0;
	for (let r = 0; r < ROWS; r++) {
		for (let c = 0; c < COLS; c++) {
			const o = r * COLS + c;
			let v = dist[o];
			if (r > 0) {
				if (dist[o - COLS] + 1 < v) v = dist[o - COLS] + 1;
				if (c > 0 && dist[o - COLS - 1] + 1.41421 < v) v = dist[o - COLS - 1] + 1.41421;
				if (c < COLS - 1 && dist[o - COLS + 1] + 1.41421 < v) v = dist[o - COLS + 1] + 1.41421;
			}
			if (c > 0 && dist[o - 1] + 1 < v) v = dist[o - 1] + 1;
			dist[o] = v;
		}
	}
	for (let r = ROWS - 1; r >= 0; r--) {
		for (let c = COLS - 1; c >= 0; c--) {
			const o = r * COLS + c;
			let v = dist[o];
			if (r < ROWS - 1) {
				if (dist[o + COLS] + 1 < v) v = dist[o + COLS] + 1;
				if (c < COLS - 1 && dist[o + COLS + 1] + 1.41421 < v) v = dist[o + COLS + 1] + 1.41421;
				if (c > 0 && dist[o + COLS - 1] + 1.41421 < v) v = dist[o + COLS - 1] + 1.41421;
			}
			if (c < COLS - 1 && dist[o + 1] + 1 < v) v = dist[o + 1] + 1;
			dist[o] = v;
		}
	}

	for (let i = 0; i < count; i++) {
		const o = row[i] * COLS + col[i];
		const xi = x[i];
		const yi = y[i];
		const px = xi - IRIS_X;
		const py = yi - IRIS_Y;
		const ri = Math.sqrt(px * px + py * py) / IRIS_R;
		const a = Math.atan2(py, px);
		rad[i] = ri;
		ang[i] = a;
		phase[i] = hash01(o * 2654435761 + 17);
		edge[i] = Math.exp(-dist[o] * 0.625);

		const up = UP0 + UP1 * xi + UP2 * xi * xi;
		const dn = LO0 + LO1 * xi + LO2 * xi * xi;
		const sd = clamp(Math.min(up - yi, yi - dn) / IRIS_R, -1, 1);
		open[i] = sd;
		lid[i] = clamp((yi - (up + dn) * 0.5) / Math.max((up - dn) * 0.5, 0.028), -3, 3);

		const gm = mag[o];
		const tilt = gm > 1e-9 ? (Math.min(gm / scale, 1.35) * 0.62) / gm : 0;
		nrm[i * 2] = -gx[o] * tilt;
		nrm[i * 2 + 1] = -gy[o] * tilt;

		const win = Math.max(0, Math.sin(Math.PI * clamp((ri - 0.26) / 0.78, 0, 1)));
		let s = (ringNoise(a, 21, 11) - 0.5) * 0.78;
		s += (ringNoise(a, 9, 2903) - 0.5) * 0.26;
		s += (crypt(a, ri, 11, 4, 7717) - 0.5) * 0.4;
		const t = (ri - 0.55) * 10;
		fiber[i] = clamp(0.5 + (s + Math.exp(-t * t) * 0.16 - 0.1) * win, 0, 1);

		const qx = xi - PUPIL_X;
		const qy = yi - PUPIL_Y;
		const rp = Math.sqrt(qx * qx + qy * qy) / PUPIL_R;
		zone[i] = rp < 1 ? 5 : ri < 0.9 ? 4 : ri < 1.1 ? 3 : sd > 0.05 ? 2 : sd > -0.55 ? 1 : 0;
	}
}

export const EYE_SHAPE = {
	unit: N,
	iris: { x: IRIS_X, y: IRIS_Y, r: IRIS_R },
	pupil: { x: PUPIL_X, y: PUPIL_Y, r: PUPIL_R },
	lidUpper: [UP0, UP1, UP2],
	lidLower: [LO0, LO1, LO2],
	canthus: [CANTHUS_L, CANTHUS_R],
	zones: ["dis", "kapak", "sklera", "limbus", "iris", "pupil"],
};

export const EYE = {
	count,
	x,
	y,
	ink,
	col,
	row,
	cols: COLS,
	rows: ROWS,
	rad,
	ang,
	edge,
	open,
	lid,
	nrm,
	fiber,
	phase,
	zone,
	shape: EYE_SHAPE,
};
